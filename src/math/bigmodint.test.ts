import BigInteger from "./bigint";
import BigModInteger from "./bigmodint";

describe("BigModInt", () => {
    describe("inverse", () => {
        it("Inverse positive number by positive number", () => {
            const modulus = BigInteger.fromValue(40832);
            const a = new BigModInteger(BigInteger.fromValue(7), modulus);
            const actual = a.inverse();
            expect(actual.unsignedHex()).toBe(BigInteger.fromValue(34999).unsignedHex());
            expect(actual.mul(a).eq(BigModInteger.one(modulus))).toBe(true);
        });
    });
});
