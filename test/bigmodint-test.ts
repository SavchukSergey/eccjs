///<reference path= "./qunit.d.ts"/>

import { BigInteger, BigModInteger } from "../src/math";

QUnit.module("BigModInt", () => {
    QUnit.module("inverse", () => {
        QUnit.test("Inverse positive number by positive number", assert => {
            const modulus = BigInteger.fromValue(40832);
            const a = new BigModInteger(BigInteger.fromValue(7), modulus);
            const actual = a.inverse();
            assert.equal(actual.unsignedHex(), BigInteger.fromValue(34999).unsignedHex(), "Result value");
            assert.equal(actual.mul(a).eq(BigModInteger.one(modulus)), true, "val * inverse(val) === 1");
        });
    });
});
