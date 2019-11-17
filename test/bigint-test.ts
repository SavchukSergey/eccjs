///<reference path= "./qunit.d.ts"/>

import { BigInteger } from "../src/math";

QUnit.module("BigInt", () => {
    QUnit.module("add", () => {
        QUnit.test("Add positive number with positive number", assert => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(0x456);
            const result = left.add(right);
            assert.equal(result.unsignedHex(), "0579");
        });
        QUnit.test("Add bigger positive number with smaller negative number", assert => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(-1);
            const result = left.add(right);
            assert.equal(result.unsignedHex(), "0122");
        });
        QUnit.test("Add smaller positive number with bigger negative number", assert => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(-0x1000);
            const result = left.add(right);
            assert.equal(result.unsignedHex(), "f123");
        });
        QUnit.test("Add bigger positive number with zero", assert => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.zero();
            const result = left.add(right);
            assert.equal(result.unsignedHex(), "0123");
        });
        QUnit.test("Add big positive number with big positive number", assert => {
            const left = BigInteger.fromValue(0xabcd);
            const right = BigInteger.fromValue(0x8001);
            const result = left.add(right);
            assert.equal(result.unsignedHex(), "012bce");
        });
    });

    QUnit.module("sub", () => {
        QUnit.test("Subtract smaller positive number from bigger positive number", assert => {
            const left = BigInteger.fromValue(0x456);
            const right = BigInteger.fromValue(0x123);
            const result = left.sub(right);
            assert.equal(result.unsignedHex(), "0333");
        });
        QUnit.test("Subtract bigger positive number from smaller positive number", assert => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(0x456);
            const result = left.sub(right);
            assert.equal(result.unsignedHex(), "fccd");
        });
        QUnit.test("Subtract zero from positive number", assert => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.zero();
            const result = left.sub(right);
            assert.equal(result.unsignedHex(), "0123");
        });
    });

    QUnit.module("negate", () => {
        QUnit.test("Negative of positive number", assert => {
            assert.equal(BigInteger.fromValue(0x456).negate().unsignedHex(), "fbaa");
            assert.equal(BigInteger.fromValue(0x123456).negate().unsignedHex(), "edcbaa");
        });
        QUnit.test("Negative of negative number", assert => {
            assert.equal(BigInteger.fromValue(-0x456).negate().unsignedHex(), "0456");
            assert.equal(BigInteger.fromValue(-0x123456).negate().unsignedHex(), "123456");
        });
        QUnit.test("Negative of zero", assert => {
            const left = BigInteger.zero();
            const result = left.negate();
            assert.equal(result.unsignedHex(), "00");
        });
    });

    QUnit.module("abs", () => {
        QUnit.test("Absolute of positive number", assert => {
            const left = BigInteger.fromValue(0x456);
            const result = left.abs();
            assert.equal(result.unsignedHex(), "0456");
        });
        QUnit.test("Absolute of negative number", assert => {
            const left = BigInteger.fromValue(-0x456);
            const result = left.abs();
            assert.equal(result.unsignedHex(), "0456");
        });
        QUnit.test("Absolute of zero", assert => {
            const left = BigInteger.zero();
            const result = left.abs();
            assert.equal(result.unsignedHex(), "00");
        });
    });

    QUnit.module("multiply", () => {
        QUnit.test("Multiply positive number by positive number", assert => {
            const left = BigInteger.fromValue(0x123456);
            const right = BigInteger.fromValue(0x456);
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "4eeeece4");
        });
        QUnit.test("Multiply positive number by negative number", assert => {
            const left = BigInteger.fromValue(0x123456);
            const right = BigInteger.fromValue(-0x456);
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "b111131c");
        });
        QUnit.test("Multiply positive number by zero", assert => {
            const left = BigInteger.fromValue(0x123456);
            const right = BigInteger.zero();
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "00");
        });

        QUnit.test("Multiply negative number by positive number", assert => {
            const left = BigInteger.fromValue(-0x123456);
            const right = BigInteger.fromValue(0x456);
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "b111131c");
        });
        QUnit.test("Multiply negative number by negative number", assert => {
            const left = BigInteger.fromValue(-0x123456);
            const right = BigInteger.fromValue(-0x456);
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "4eeeece4");
        });
        QUnit.test("Multiply negative number by zero", assert => {
            const left = BigInteger.fromValue(-0x123456);
            const right = BigInteger.zero();
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "00");
        });

        QUnit.test("Multiply zero by positive number", assert => {
            const left = BigInteger.zero();
            const right = BigInteger.fromValue(0x456);
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "00");
        });
        QUnit.test("Multiply zero by negative number", assert => {
            const left = BigInteger.zero();
            const right = BigInteger.fromValue(-0x456);
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "00");
        });
        QUnit.test("Multiply zero by zero", assert => {
            const left = BigInteger.zero();
            const right = BigInteger.zero();
            const result = left.mul(right);
            assert.equal(result.unsignedHex(), "00");
        });
    });

    QUnit.module("divRem", () => {
        QUnit.test("DivRem positive number by positive number", assert => {
            const divident = BigInteger.fromValue(0x123456);
            const divisor = BigInteger.fromValue(0x456);
            const result = divident.divRem(divisor);
            assert.equal(result.quotient.unsignedHex(), "0432");
            assert.equal(result.reminder.unsignedHex(), "038a");
            assert.equal(result.quotient.mul(divisor).add(result.reminder).unsignedHex(), "123456");
        });
        QUnit.test("DivRem positive number by negative number", assert => {
            const divident = BigInteger.fromValue(0x123456);
            const divisor = BigInteger.fromValue(-0x456);
            const result = divident.divRem(divisor);
            assert.equal(result.quotient.unsignedHex(), "fbce");
            assert.equal(result.reminder.unsignedHex(), "038a");
            assert.equal(result.quotient.mul(divisor).add(result.reminder).unsignedHex(), "123456");
        });
        QUnit.test("DivRem positive number by zero", assert => {
            assert.throws(() => {
                const divident = BigInteger.fromValue(0x123456);
                const divisor = BigInteger.zero();
                divident.divRem(divisor);
            });
        });

        QUnit.test("DivRem negative number by positive number", assert => {
            const divident = BigInteger.fromValue(-0x123456);
            const divisor = BigInteger.fromValue(0x456);
            const result = divident.divRem(divisor);
            assert.equal(result.quotient.unsignedHex(), "fbce");
            assert.equal(result.reminder.unsignedHex(), "fc76");
            assert.equal(result.quotient.mul(divisor).add(result.reminder).unsignedHex(), "edcbaa");
        });
        QUnit.test("DivRem negative number by negative number", assert => {
            const divident = BigInteger.fromValue(-0x123456);
            const divisor = BigInteger.fromValue(-0x456);
            const result = divident.divRem(divisor);
            assert.equal(result.quotient.unsignedHex(), "0432");
            assert.equal(result.reminder.unsignedHex(), "fc76");
            assert.equal(result.quotient.mul(divisor).add(result.reminder).unsignedHex(), "edcbaa");
        });
        QUnit.test("DivRem negative number by zero", assert => {
            assert.throws(() => {
                const divident = BigInteger.fromValue(-0x123456);
                const divisor = BigInteger.zero();
                divident.divRem(divisor);
            });
        });

        QUnit.test("DivRem zero by positive number", assert => {
            const divident = BigInteger.zero();
            const divisor = BigInteger.fromValue(0x456);
            const result = divident.divRem(divisor);
            assert.equal(result.quotient.unsignedHex(), "00");
            assert.equal(result.reminder.unsignedHex(), "00");
            assert.equal(result.quotient.mul(divisor).add(result.reminder).unsignedHex(), "00");
        });
        QUnit.test("DivRem zero by negative number", assert => {
            const divident = BigInteger.zero();
            const divisor = BigInteger.fromValue(-0x456);
            const result = divident.divRem(divisor);
            assert.equal(result.quotient.unsignedHex(), "00");
            assert.equal(result.reminder.unsignedHex(), "00");
            assert.equal(result.quotient.mul(divisor).add(result.reminder).unsignedHex(), "00");
        });
        QUnit.test("DivRem zero by zero", assert => {
            assert.throws(() => {
                const divident = BigInteger.zero();
                const divisor = BigInteger.zero();
                divident.divRem(divisor);
            });
        });
    });

    QUnit.module("half", () => {
        QUnit.test("Half of positive number", assert => {
            const source = BigInteger.fromValue(0x456);
            const results = ["022b", "0115", "008a", "45", "22", "11", "08", "04", "02", "01", "00"];
            let actual = source;
            for (const expected of results) {
                actual = actual.half();
                assert.equal(actual.unsignedHex(), expected);
            }
        });
        QUnit.test("Half of negative number", assert => {
            const source = BigInteger.fromValue(-0x456);
            const results = ["fdd5", "feea", "ff75", "ba", "dd", "ee", "f7", "fb", "fd", "fe", "ff"];
            let actual = source;
            for (const expected of results) {
                actual = actual.half();
                assert.equal(actual.unsignedHex(), expected);
            }
        });
        QUnit.test("Half of zero", assert => {
            const source = BigInteger.zero();
            const actual = source.half();
            assert.equal(actual.unsignedHex(), "00");
        });
    });

    QUnit.module("odd", () => {
        QUnit.test("Odd of odd number", assert => {
            assert.equal(BigInteger.fromValue(1).odd(), true);
            assert.equal(BigInteger.fromValue(11).odd(), true);
            assert.equal(BigInteger.fromValue(111).odd(), true);
        });
        QUnit.test("Odd of even number", assert => {
            assert.equal(BigInteger.fromValue(0).odd(), false);
            assert.equal(BigInteger.fromValue(10).odd(), false);
            assert.equal(BigInteger.fromValue(100).odd(), false);
        });
    });

    QUnit.module("egcd", () => {
        QUnit.test("Euclid extended positive by positive", assert => {
            const res = BigInteger.euclidExtended(BigInteger.fromValue(51051), BigInteger.fromValue(21483));
            assert.equal(BigInteger.fromValue(51051).unsignedHex(), res.a.unsignedHex());
            assert.equal(BigInteger.fromValue(21483).unsignedHex(), res.b.unsignedHex());
            assert.equal(BigInteger.fromValue(8).unsignedHex(), res.x.unsignedHex());
            assert.equal(BigInteger.fromValue(-19).unsignedHex(), res.y.unsignedHex());
            assert.equal(BigInteger.fromValue(231).unsignedHex(), res.gcd.unsignedHex());
        });
    });

    QUnit.module("parse", () => {
        QUnit.test("Parse from unsigned hex", assert => {
            assert.equal(BigInteger.parseUnsignedHex("00").unsignedHex(), "00");
            assert.equal(BigInteger.parseUnsignedHex("01").unsignedHex(), "01");
            assert.equal(BigInteger.parseUnsignedHex("ff").unsignedHex(), "00ff");
        });
    });
});
