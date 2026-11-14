process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "mongodb://localhost:27018/queuemate_test?replicaSet=rs0&directConnection=true";
process.env.SESSION_SECRET ??= "test-session-secret-with-at-least-thirty-two-characters";
process.env.MINIO_ENDPOINT ??= "http://localhost:9000";
process.env.MINIO_ACCESS_KEY ??= "test-access";
process.env.MINIO_SECRET_KEY ??= "test-secret-key";
process.env.MINIO_BUCKET ??= "queuemate-test";
