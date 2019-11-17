///<reference path= "./qunit.d.ts"/>

import { ECAffinePoint, ECurve } from "../src";
import { BigInteger, BigModInteger } from "../src/math";

const rfc7517Sample = {
    d: "870MB6gfuTJ4HtUnUvYMyJpr5eUZNP4Bk43bVdj3eAE",
    x: "MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
    y: "4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM"
};

QUnit.module("Ecc", () => {
    const curve = new ECurve("test",
        BigInteger.fromValue(-1),
        BigInteger.fromValue(3),
        BigInteger.fromValue(127),
        BigInteger.zero(),
        BigInteger.zero(),
        BigInteger.zero(),
        BigInteger.zero());

    QUnit.module("curve", () => {
        QUnit.module("createPrivateKey", () => {
            QUnit.test("RFC7517 sample", assert => {
                const d = BigInteger.parseUnsignedBase64Url(rfc7517Sample.d);
                const nistP256 = ECurve.nistP256();
                const privateKey = nistP256.createPrivateKey(d);
                assert.equal(privateKey.d.unsignedBase64Url(32), rfc7517Sample.d);
            });
        });
        QUnit.module("has", () => {
            QUnit.test("Has valid point", assert => {
                const p256 = ECurve.nistP256();
                assert.equal(true, curve.has(curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(20))));
                assert.equal(true, p256.has(p256.createPoint(BigInteger.parseUnsignedBase64Url(rfc7517Sample.x), BigInteger.parseUnsignedBase64Url(rfc7517Sample.y))));
            });
            QUnit.test("Does not have invalid point", assert => {
                assert.equal(false, curve.has(curve.createPoint(BigInteger.fromValue(15), BigInteger.fromValue(20))));
                assert.equal(false, curve.has(curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(21))));
            });
            QUnit.test("Has infinity point", assert => {
                assert.equal(true, curve.has(ECAffinePoint.infinity(curve)));
            });
        });
    });

    QUnit.module("privateKey", () => {
        QUnit.module("Derive PublicKey", () => {
            QUnit.test("RFC7517 sample", assert => {
                const d = BigInteger.parseUnsignedBase64Url(rfc7517Sample.d);
                const nistP256 = ECurve.nistP256();
                const privateKey = nistP256.createPrivateKey(d);

                const publicKey = privateKey.publicKey();
                assert.equal(nistP256.has(publicKey.point), true, "Point is on curve");
                assert.equal(publicKey.point.x.unsignedBase64Url(32), rfc7517Sample.x, "X");
                assert.equal(publicKey.point.y.unsignedBase64Url(32), rfc7517Sample.y, "Y");

            });
        });
    });

    QUnit.module("point", () => {
        QUnit.test("Add district points", assert => {
            const p = curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(20));
            const q = curve.createPoint(BigInteger.fromValue(41), BigInteger.fromValue(120));
            const r = p.add(q);
            assert.equal(curve.has(r), true);
            assert.equal(r.x.unsignedHex(), "56");
            assert.equal(r.y.unsignedHex(), "51");
        });
        QUnit.test("Add same point", assert => {
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
                assert.equal(curve.has(r), true);
                assert.equal(r.x.unsignedHex(), tx.unsignedHex());
                assert.equal(r.y.unsignedHex(), ty.unsignedHex());
            }
        });
        QUnit.test("negate", assert => {
            const p = curve.createPoint(BigInteger.fromValue(16), BigInteger.fromValue(20));
            const q = p.negate();
            assert.equal(curve.has(q), true);
            const sum = p.add(q);
            assert.equal(sum.infinity(), true);
        });
        QUnit.test("mul", assert => {
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
                const p2 = p1.mul(new BigModInteger(BigInteger.fromValue(k), shortCurve.modulus));
                assert.equal(shortCurve.has(p2), true, `Multiply by ${k}. On curve`);
                if (x.zero() && y.zero()) {
                    assert.equal(p2.infinity(), true);
                } else {
                    assert.equal(p2.x.unsignedHex(), x.unsignedHex(), `Multiply by ${k}. X`);
                    assert.equal(p2.y.unsignedHex(), y.unsignedHex(), `Multiply by ${k}. Y`);
                }
            }
        });
    });
});
