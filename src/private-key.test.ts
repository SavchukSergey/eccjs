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
        expect(signature.hex()).toBe("2794dd08b1dfa958552bc37916515a3accb0527e40f9291d62cc4316047d24dd5dd1f95f962bb6871967dc17b22217100daa00a3756feb1e16be3e6936fd8594");
    });

    test.each([
        ["42c6d7b9570c75e3778b3ac7bfd851198816da1dd39ce420f16378c9418b8a58", "0320319526ae7bb161eb650486c9c4ff80ab4f9e18d04d9da3651000d0ac335f16"],
        ["754119b222e208b4c24936bd6aae22b3f760956f905103270705e5257e467344", "02334180cfb8553b774d871c36be174171003cd13cb8325ad091b4f4b10934662f"],
        ["9ada5ef64bff005b95afb0acb5f7d51df1f42ed5435c09ab7eb4ed9b6eb08572", "02861529d088817d897efcc7233ff344a85c905bd2ae524b359eacd39537b5cb8e"]
    ])("should generate public key", (privateKeyHex, publicKeyHex) => {
        const curve = ECurve.secp256k1();
        const privateKey = curve.createPrivateKey(BigInteger.parseUnsignedHex(privateKeyHex));
        const publicKey = privateKey.publicKey();
        expect(publicKey.hex(true)).toBe(publicKeyHex);
    });
});