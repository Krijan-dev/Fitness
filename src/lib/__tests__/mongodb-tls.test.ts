import { mongoConnectionOptions } from "@/lib/mongo-tls";

describe("MongoDB TLS connection options", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalTls = process.env.MONGODB_TLS;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalTls === undefined) {
      delete process.env.MONGODB_TLS;
    } else {
      process.env.MONGODB_TLS = originalTls;
    }
  });

  it("does not force TLS on localhost", () => {
    process.env.NODE_ENV = "production";
    const opts = mongoConnectionOptions("mongodb://127.0.0.1:27017/app");
    expect(opts.tls).toBeUndefined();
  });

  it("forces TLS with certificate validation for Atlas", () => {
    process.env.NODE_ENV = "production";
    const opts = mongoConnectionOptions(
      "mongodb+srv://user:pass@cluster.mongodb.net/app"
    );
    expect(opts.tls).toBe(true);
    expect(opts.tlsAllowInvalidCertificates).toBe(false);
  });

  it("forces TLS when MONGODB_TLS=true", () => {
    process.env.NODE_ENV = "development";
    process.env.MONGODB_TLS = "true";
    const opts = mongoConnectionOptions("mongodb://db.internal:27017/app");
    expect(opts.tls).toBe(true);
    expect(opts.tlsAllowInvalidCertificates).toBe(false);
  });
});
