import { ECAffinePoint, ECurve } from "../src";
import { BigInteger } from "../src/math";

const rfc7517Sample = {
    d: "870MB6gfuTJ4HtUnUvYMyJpr5eUZNP4Bk43bVdj3eAE",
    x: "MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
    y: "4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM"
};

describe("Ecc", () => {

    const curve = new ECurve("test",
        BigInteger.fromValue(-1),
        BigInteger.fromValue(3),
        BigInteger.fromValue(127),
        BigInteger.zero(),
        BigInteger.zero(),
        BigInteger.zero(),
        BigInteger.zero());

    const nistP256 = ECurve.nistP256();

    describe("curve", () => {
        describe("createPrivateKey", () => {
            it("RFC7517 sample", () => {
                const d = BigInteger.parseUnsignedBase64Url(rfc7517Sample.d);
                const privateKey = nistP256.createPrivateKey(d);
                expect(privateKey.d.unsignedBase64Url(32)).toBe(rfc7517Sample.d);
            });
        });
        describe("has", () => {
            it("Has valid point", () => {
                expect(curve.has(curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(20)))).toBe(true);
                expect(nistP256.has(nistP256.createPoint(BigInteger.parseUnsignedBase64Url(rfc7517Sample.x), BigInteger.parseUnsignedBase64Url(rfc7517Sample.y)))).toBe(true);
            });
            it("Does not have invalid point", () => {
                expect(curve.has(curve.createPoint(BigInteger.fromValue(15), BigInteger.fromValue(20)))).toBe(false);
                expect(curve.has(curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(21)))).toBe(false);
            });
            it("Has infinity point", () => {
                expect(nistP256.has(ECAffinePoint.infinity(nistP256))).toBe(true);
            });
        });

        describe("namedCurves", () => {
            it("should use caching", () => {
                expect(ECurve.nistP256()).toStrictEqual(ECurve.nistP256());
            });
        });
    });

    describe("privateKey", () => {
        describe("Derive PublicKey", () => {
            it("RFC7517 sample", () => {
                const d = BigInteger.parseUnsignedBase64Url(rfc7517Sample.d);
                const privateKey = nistP256.createPrivateKey(d);

                const publicKey = privateKey.publicKey();
                expect(nistP256.has(publicKey.point)).toBe(true);
                expect(publicKey.point.x.unsignedBase64Url(32)).toBe(rfc7517Sample.x);
                expect(publicKey.point.y.unsignedBase64Url(32)).toBe(rfc7517Sample.y);

            });
        });
    });

    describe("point", () => {
        it("Add district points", () => {
            const p = curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(20));
            const q = curve.createPoint(BigInteger.fromValue(41), BigInteger.fromValue(120));
            const r = p.add(q);
            expect(curve.has(r)).toBe(true);
            expect(r.x.unsignedHex()).toBe("56");
            expect(r.y.unsignedHex()).toBe("51");
        });
        it("Add same point", () => {
            const cases = [
                [16, 20, 97, 81],
                [41, 120, 42, 95],
            ];
            for (const testCase of cases) {
                const sx = BigInteger.fromValue(testCase[0]);
                const sy = BigInteger.fromValue(testCase[1]);
                const p = curve.createPoint(sx, sy);
                const tx = BigInteger.fromValue(testCase[2]);
                const ty = BigInteger.fromValue(testCase[3]);
                const r = p.add(p);
                expect(curve.has(r)).toBe(true);
                expect(r.x.unsignedHex()).toBe(tx.unsignedHex());
                expect(r.y.unsignedHex()).toBe(ty.unsignedHex());
            }
        });
        it("negate", () => {
            const p = curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(20));
            const q = p.negate();
            expect(curve.has(q)).toBe(true);
            const sum = p.add(q);
            expect(sum.infinity()).toBe(true);
        });
        it("mul", () => {
            const cases = [
                [1, 3, 6],
                [2, 80, 10],
                [3, 80, 87],
                [4, 3, 91],
                [5, 0, 0],
                [6, 3, 6],
            ];
            const shortCurve = new ECurve("test",
                BigInteger.fromValue(2),
                BigInteger.fromValue(3),
                BigInteger.fromValue(97),
                BigInteger.zero(),
                BigInteger.zero(),
                BigInteger.zero(),
                BigInteger.zero());
            const p1 = shortCurve.createPoint(BigInteger.fromValue(3), BigInteger.fromValue(6));
            for (const testCase of cases) {
                const k = testCase[0];
                const x = BigInteger.fromValue(testCase[1]);
                const y = BigInteger.fromValue(testCase[2]);
                const p2 = p1.mul(BigInteger.fromValue(k));
                expect(shortCurve.has(p2)).toBe(true);
                if (x.zero() && y.zero()) {
                    expect(p2.infinity()).toBe(true);
                } else {
                    expect(p2.x.unsignedHex()).toBe(x.unsignedHex());
                    expect(p2.y.unsignedHex()).toBe(y.unsignedHex());
                }
            }
        });
    });

    describe("privateKey -> publicKey performance", () => {
        it("should work", () => {
            const count = 10;
            const start = new Date().valueOf();
            for (let i = 0; i < count; i++) {
                const rnd = BigInteger.random(256);
                const keyPair = nistP256.createPrivateKey(rnd);
                const pubKey = keyPair.publicKey();
                expect(pubKey).toBeTruthy();
            }
            const end = new Date().valueOf();
            const secs = (end - start) / 1000;
            const kps = count / secs;
            console.log(`keys per second: ${kps}`);
        });
    });

});
