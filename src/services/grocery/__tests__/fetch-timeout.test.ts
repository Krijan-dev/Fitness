import { fetchWithTimeout } from "../http-headers";

describe("fetchWithTimeout", () => {
  it("aborts slow requests", async () => {
    const start = Date.now();
    await expect(
      fetchWithTimeout(
        "https://httpbin.org/delay/10",
        { method: "GET" },
        200
      )
    ).rejects.toThrow();
    expect(Date.now() - start).toBeLessThan(3000);
  });
});
