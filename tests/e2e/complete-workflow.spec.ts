import { expect, request as createRequest, test, type APIRequestContext } from "@playwright/test";

const password = "QueueMateDev!2026";

async function session(email: string, baseURL: string) {
  const context = await createRequest.newContext({ baseURL });
  const login = await context.post("/api/v1/auth/login", { data: { email, password } });
  expect(login.ok(), await login.text()).toBeTruthy();
  const body = await login.json();
  return { context, csrf: body.data.csrfToken as string };
}

const mutation = (csrf: string) => ({ "x-csrf-token": csrf });

test("customer request moves through payment, approval, assignment, and completion", async ({ baseURL }) => {
  const customer = await session("customer@queuemate.local", baseURL!);
  const institutionsResponse = await customer.context.get("/api/v1/public/institutions");
  expect(institutionsResponse.ok()).toBeTruthy();
  const institutions = (await institutionsResponse.json()).data;
  const institution = institutions[0];
  expect(institution).toBeTruthy();

  const scheduled = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const requestedDate = scheduled.toISOString().slice(0, 10);
  const preferredArrivalTime = "10:00";
  const createdResponse = await customer.context.post("/api/v1/requests", {
    headers: mutation(customer.csrf),
    data: {
      institutionId: institution.id,
      serviceTypeId: institution.permissions[0].serviceType.id,
      requestedDate,
      preferredArrivalTime,
      assistanceFor: "SELF",
      instructions: "Please check in and hold the customer's place in the permitted queue.",
      contactName: "QueueMate Test Customer",
      contactMobile: "+26771234567",
      contactEmail: "customer@queuemate.local",
      acknowledgeAvailability: true,
      acknowledgeInstitutionRules: true,
      acknowledgeNoImpersonation: true,
    },
  });
  expect(createdResponse.ok(), await createdResponse.text()).toBeTruthy();
  const serviceRequest = (await createdResponse.json()).data;
  expect(serviceRequest.reference).toMatch(/^QM-\d{4}-\d{6}$/);

  const proofResponse = await customer.context.post(`/api/v1/payments/${serviceRequest.id}/proof`, {
    headers: mutation(customer.csrf),
    multipart: {
      amountSubmitted: String(serviceRequest.quotedAmount),
      paymentReference: `E2E-${Date.now()}`,
      proof: { name: "payment-proof.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n% QueueMate end-to-end proof\n%%EOF") },
    },
  });
  expect(proofResponse.ok(), await proofResponse.text()).toBeTruthy();
  const payment = (await proofResponse.json()).data;

  const admin = await session("admin@queuemate.local", baseURL!);
  const forbidden = await customer.context.get("/api/v1/admin/dashboard");
  expect(forbidden.status()).toBe(403);
  const verifyResponse = await admin.context.patch(`/api/v1/admin/payments/${payment.id}/verify`, {
    headers: mutation(admin.csrf), data: { notes: "Verified against the test bank transfer reference." },
  });
  expect(verifyResponse.ok(), await verifyResponse.text()).toBeTruthy();
  const approveResponse = await admin.context.patch(`/api/v1/admin/requests/${serviceRequest.id}/approve`, {
    headers: mutation(admin.csrf), data: {},
  });
  expect(approveResponse.ok(), await approveResponse.text()).toBeTruthy();

  const agentsResponse = await admin.context.get("/api/v1/admin/agents");
  const agents = (await agentsResponse.json()).data;
  const agentProfile = agents.find((item: { available: boolean; user: { status: string } }) => item.available && item.user.status === "ACTIVE");
  expect(agentProfile).toBeTruthy();
  const assignmentResponse = await admin.context.post("/api/v1/admin/assignments", {
    headers: mutation(admin.csrf),
    data: {
      requestId: serviceRequest.id,
      agentId: agentProfile.id,
      travelBufferMinutes: 30,
      overrideConflict: true,
      overrideReason: "Automated end-to-end verification may overlap a previous test run.",
    },
  });
  expect(assignmentResponse.ok(), await assignmentResponse.text()).toBeTruthy();
  const assignment = (await assignmentResponse.json()).data;

  const agent = await session(agentProfile.user.email, baseURL!);
  for (const status of ["ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"] as const) {
    const transition = await agent.context.patch(`/api/v1/agent/assignments/${assignment.id}/status`, {
      headers: mutation(agent.csrf), data: { status },
    });
    expect(transition.ok(), `${status}: ${await transition.text()}`).toBeTruthy();
  }
  const completed = await agent.context.patch(`/api/v1/agent/assignments/${assignment.id}/status`, {
    headers: mutation(agent.csrf),
    data: { status: "COMPLETED", outcome: "The permitted queue assistance was completed successfully.", permittedReference: "E2E-COMPLETE" },
  });
  expect(completed.ok(), await completed.text()).toBeTruthy();

  const finalResponse = await customer.context.get(`/api/v1/requests/${serviceRequest.id}`);
  const finalRequest = (await finalResponse.json()).data;
  expect(finalRequest.requestStatus).toBe("COMPLETED");
  expect(finalRequest.paymentStatus).toBe("VERIFIED");

  await Promise.all([customer.context.dispose(), admin.context.dispose(), agent.context.dispose()]);
});
