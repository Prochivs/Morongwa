export type Role = "CUSTOMER" | "AGENT" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: Role;
  emailVerified: boolean;
};

export type AuthPayload = {
  user: User;
  token: string;
  expiresAt: string;
};

export type RequestListItem = {
  id: string;
  reference: string;
  requestStatus: string;
  paymentStatus: string;
  requestedDate: string;
  preferredArrivalTime: string;
  scheduledStartAt: string;
  quotedAmount: string;
  currency: string;
  createdAt: string;
  institution: { name: string; city: string };
};

export type AssignmentListItem = {
  id: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  request: {
    reference: string;
    instructions?: string;
    institution: { name: string; address: string; city: string };
    customer: { fullName: string; mobile: string };
  };
};

export type NotificationItem = {
  id: string;
  requestId?: string;
  title: string;
  message: string;
  readAt?: string;
  createdAt: string;
};
