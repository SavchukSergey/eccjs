import { ECurve } from "./curve";
import { BigInteger } from "./math";

describe("ECPrivateKey", () => {

    it("should sign int", () => {
        const curve = ECurve.secp256k1();
        const privateKey = curve.createPrivateKey(BigInteger.parseUnsignedHex("8ce00ada2dffcfe03bd4775e90588f3f039bd83d56026fafd6f33080ebff72e8"));
        const msg = BigInteger.parseUnsignedHex("7846e3be8abd2e089ed812475be9b51c3cfcc1a04fafa2ddb6ca6869bf272715");
        const random = BigInteger.parseUnsignedHex("cd6f06360fa5af8415f7a678ab45d8c1d435f8cf054b0f5902237e8cb9ee5fe5");
        const signature = privateKey.sign(msg, random);

        expect(signature).toBeTruthy();

        const rhex = signature.r.unsignedHex(32);
        const shex = signature.s.unsignedHex(32);
        expect(rhex).toBe("2794dd08b1dfa958552bc37916515a3accb0527e40f9291d62cc4316047d24dd");
        expect(shex).toBe("5dd1f95f962bb6871967dc17b22217100daa00a3756feb1e16be3e6936fd8594");
        expect(signature.hexString()).toBe("2794dd08b1dfa958552bc37916515a3accb0527e40f9291d62cc4316047d24dd5dd1f95f962bb6871967dc17b22217100daa00a3756feb1e16be3e6936fd8594");
    })
});