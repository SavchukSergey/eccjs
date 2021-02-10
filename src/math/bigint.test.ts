import BigInteger from "./bigint";

describe("BigInt", () => {
    describe("add", () => {
        it("Add positive number with positive number", () => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(0x456);
            const result = left.add(right);
            expect(result.unsignedHex()).toBe("0579");
        });
        it("Add bigger positive number with smaller negative number", () => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(-1);
            const result = left.add(right);
            expect(result.unsignedHex()).toBe("0122");
        });
        it("Add smaller positive number with bigger negative number", () => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(-0x1000);
            const result = left.add(right);
            expect(result.unsignedHex()).toBe("f123");
        });
        it("Add bigger positive number with zero", () => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.zero();
            const result = left.add(right);
            expect(result.unsignedHex()).toBe("0123");
        });
        it("Add big positive number with big positive number", () => {
            const left = BigInteger.fromValue(0xabcd);
            const right = BigInteger.fromValue(0x8001);
            const result = left.add(right);
            expect(result.unsignedHex()).toBe("012bce");
        });
    });

    describe("sub", () => {
        it("Subtract smaller positive number from bigger positive number", () => {
            const left = BigInteger.fromValue(0x456);
            const right = BigInteger.fromValue(0x123);
            const result = left.sub(right);
            expect(result.unsignedHex()).toBe("0333");
        });
        it("Subtract bigger positive number from smaller positive number", () => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.fromValue(0x456);
            const result = left.sub(right);
            expect(result.unsignedHex()).toBe("fccd");
        });
        it("Subtract zero from positive number", () => {
            const left = BigInteger.fromValue(0x123);
            const right = BigInteger.zero();
            const result = left.sub(right);
            expect(result.unsignedHex()).toBe("0123");
        });
    });

    describe("negate", () => {
        it("Negative of positive number", () => {
            expect(BigInteger.fromValue(0x456).negate().unsignedHex()).toBe("fbaa");
            expect(BigInteger.fromValue(0x123456).negate().unsignedHex()).toBe("edcbaa");
        });
        it("Negative of negative number", () => {
            expect(BigInteger.fromValue(-0x456).negate().unsignedHex()).toBe("0456");
            expect(BigInteger.fromValue(-0x123456).negate().unsignedHex()).toBe("123456");
        });
        it("Negative of zero", () => {
            const left = BigInteger.zero();
            const result = left.negate();
            expect(result.unsignedHex()).toBe("00");
        });
    });

    describe("abs", () => {
        it("Absolute of positive number", () => {
            const left = BigInteger.fromValue(0x456);
            const result = left.abs();
            expect(result.unsignedHex()).toBe("0456");
        });
        it("Absolute of negative number", () => {
            const left = BigInteger.fromValue(-0x456);
            const result = left.abs();
            expect(result.unsignedHex()).toBe("0456");
        });
        it("Absolute of zero", () => {
            const left = BigInteger.zero();
            const result = left.abs();
            expect(result.unsignedHex()).toBe("00");
        });
    });

    describe("multiply", () => {
        it("Multiply positive number by positive number", () => {
            const left = BigInteger.fromValue(0x123456);
            const right = BigInteger.fromValue(0x456);
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("4eeeece4");
        });
        it("Multiply positive number by negative number", () => {
            const left = BigInteger.fromValue(0x123456);
            const right = BigInteger.fromValue(-0x456);
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("b111131c");
        });
        it("Multiply positive number by zero", () => {
            const left = BigInteger.fromValue(0x123456);
            const right = BigInteger.zero();
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("00");
        });

        it("Multiply negative number by positive number", () => {
            const left = BigInteger.fromValue(-0x123456);
            const right = BigInteger.fromValue(0x456);
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("b111131c");
        });
        it("Multiply negative number by negative number", () => {
            const left = BigInteger.fromValue(-0x123456);
            const right = BigInteger.fromValue(-0x456);
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("4eeeece4");
        });
        it("Multiply negative number by zero", () => {
            const left = BigInteger.fromValue(-0x123456);
            const right = BigInteger.zero();
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("00");
        });

        it("Multiply zero by positive number", () => {
            const left = BigInteger.zero();
            const right = BigInteger.fromValue(0x456);
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("00");
        });
        it("Multiply zero by negative number", () => {
            const left = BigInteger.zero();
            const right = BigInteger.fromValue(-0x456);
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("00");
        });
        it("Multiply zero by zero", () => {
            const left = BigInteger.zero();
            const right = BigInteger.zero();
            const result = left.mul(right);
            expect(result.unsignedHex()).toBe("00");
        });
    });

    describe("divRem", () => {
        it("DivRem positive number by positive number", () => {
            const divident = BigInteger.fromValue(0x123456);
            const divisor = BigInteger.fromValue(0x456);
            const result = divident.divRem(divisor);
            expect(result.quotient.unsignedHex()).toBe("0432");
            expect(result.reminder.unsignedHex()).toBe("038a");
            expect(result.quotient.mul(divisor).add(result.reminder).unsignedHex()).toBe("123456");
        });
        it("DivRem positive number by negative number", () => {
            const divident = BigInteger.fromValue(0x123456);
            const divisor = BigInteger.fromValue(-0x456);
            const result = divident.divRem(divisor);
            expect(result.quotient.unsignedHex()).toBe("fbce");
            expect(result.reminder.unsignedHex()).toBe("038a");
            expect(result.quotient.mul(divisor).add(result.reminder).unsignedHex()).toBe("123456");
        });
        it("DivRem positive number by zero", () => {
            expect(() => {
                const divident = BigInteger.fromValue(0x123456);
                const divisor = BigInteger.zero();
                divident.divRem(divisor);
            }).toThrow();
        });

        it("DivRem negative number by positive number", () => {
            const divident = BigInteger.fromValue(-0x123456);
            const divisor = BigInteger.fromValue(0x456);
            const result = divident.divRem(divisor);
            expect(result.quotient.unsignedHex()).toBe("fbce");
            expect(result.reminder.unsignedHex()).toBe("fc76");
            expect(result.quotient.mul(divisor).add(result.reminder).unsignedHex()).toBe("edcbaa");
        });
        it("DivRem negative number by negative number", () => {
            const divident = BigInteger.fromValue(-0x123456);
            const divisor = BigInteger.fromValue(-0x456);
            const result = divident.divRem(divisor);
            expect(result.quotient.unsignedHex()).toBe("0432");
            expect(result.reminder.unsignedHex()).toBe("fc76");
            expect(result.quotient.mul(divisor).add(result.reminder).unsignedHex()).toBe("edcbaa");
        });
        it("DivRem negative number by zero", () => {
            expect(() => {
                const divident = BigInteger.fromValue(-0x123456);
                const divisor = BigInteger.zero();
                divident.divRem(divisor);
            }).toThrow();
        });

        it("DivRem zero by positive number", () => {
            const divident = BigInteger.zero();
            const divisor = BigInteger.fromValue(0x456);
            const result = divident.divRem(divisor);
            expect(result.quotient.unsignedHex()).toBe("00");
            expect(result.reminder.unsignedHex()).toBe("00");
            expect(result.quotient.mul(divisor).add(result.reminder).unsignedHex()).toBe("00");
        });
        it("DivRem zero by negative number", () => {
            const divident = BigInteger.zero();
            const divisor = BigInteger.fromValue(-0x456);
            const result = divident.divRem(divisor);
            expect(result.quotient.unsignedHex()).toBe("00");
            expect(result.reminder.unsignedHex()).toBe("00");
            expect(result.quotient.mul(divisor).add(result.reminder).unsignedHex()).toBe("00");
        });
        it("DivRem zero by zero", () => {
            expect(() => {
                const divident = BigInteger.zero();
                const divisor = BigInteger.zero();
                divident.divRem(divisor);
            }).toThrow();
        });
    });

    describe("half", () => {
        it("Half of positive number", () => {
            const source = BigInteger.fromValue(0x456);
            const results = ["022b", "0115", "008a", "45", "22", "11", "08", "04", "02", "01", "00"];
            let actual = source;
            for (const expected of results) {
                actual = actual.half();
                expect(actual.unsignedHex()).toBe(expected);
            }
        });
        it("Half of negative number", () => {
            const source = BigInteger.fromValue(-0x456);
            const results = ["fdd5", "feea", "ff75", "ba", "dd", "ee", "f7", "fb", "fd", "fe", "ff"];
            let actual = source;
            for (const expected of results) {
                actual = actual.half();
                expect(actual.unsignedHex()).toBe(expected);
            }
        });
        it("Half of zero", () => {
            const source = BigInteger.zero();
            const actual = source.half();
            expect(actual.unsignedHex()).toBe("00");
        });
    });

    describe("odd", () => {
        it("Odd of odd number", () => {
            expect(BigInteger.fromValue(1).odd()).toBe(true);
            expect(BigInteger.fromValue(11).odd()).toBe(true);
            expect(BigInteger.fromValue(111).odd()).toBe(true);
        });
        it("Odd of even number", () => {
            expect(BigInteger.fromValue(0).odd()).toBe(false);
            expect(BigInteger.fromValue(10).odd()).toBe(false);
            expect(BigInteger.fromValue(100).odd()).toBe(false);
        });
    });

    describe("egcd", () => {
        it("Euclid extended positive by positive", () => {
            const res = BigInteger.euclidExtended(BigInteger.fromValue(51051), BigInteger.fromValue(21483));
            expect(BigInteger.fromValue(51051).unsignedHex()).toBe(res.a.unsignedHex());
            expect(BigInteger.fromValue(21483).unsignedHex()).toBe(res.b.unsignedHex());
            expect(BigInteger.fromValue(8).unsignedHex()).toBe(res.x.unsignedHex());
            expect(BigInteger.fromValue(-19).unsignedHex()).toBe(res.y.unsignedHex());
            expect(BigInteger.fromValue(231).unsignedHex()).toBe(res.gcd.unsignedHex());
        });
    });

    describe("parse", () => {
        it("Parse from unsigned hex", () => {
            expect(BigInteger.parseUnsignedHex("00").unsignedHex()).toBe("00");
            expect(BigInteger.parseUnsignedHex("01").unsignedHex()).toBe("01");
            expect(BigInteger.parseUnsignedHex("ff").unsignedHex()).toBe("00ff");
        });
    });
});
