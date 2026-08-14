import { accountInitials } from "@/components/layout/account-initials";

describe("accountInitials", () => {
  it("uses first and last name letters", () => {
    expect(accountInitials("Krijan Khadka")).toBe("KK");
  });

  it("uses two letters from a single name", () => {
    expect(accountInitials("Alex")).toBe("AL");
  });

  it("falls back when the name is empty", () => {
    expect(accountInitials("   ")).toBe("?");
  });
});
