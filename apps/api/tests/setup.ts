process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://queuemate:queuemate_dev_password@localhost:5432/queuemate_test?schema=public";
process.env.SESSION_SECRET ??= "test-session-secret-with-at-least-thirty-two-characters";
process.env.MINIO_ENDPOINT ??= "http://localhost:9000";
process.env.MINIO_ACCESS_KEY ??= "test-access";
process.env.MINIO_SECRET_KEY ??= "test-secret-key";
process.env.MINIO_BUCKET ??= "queuemate-test";
