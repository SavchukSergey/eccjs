import BigInteger, { BigIntegerSign } from "./bigint";

export default class BigModInteger {

    constructor(
        public readonly value: BigInteger,
        public readonly modulus: BigInteger
    ) {
    }

    public unsignedBase64Url(length = -1): string {
        return this.value.unsignedBase64Url(length);
    }

    public unsignedHex(length?: number): string {
        return this.value.unsignedHex(length);
    }

    public even(): boolean {
        return this.value.even();
    }

    public add(other: BigModInteger): BigModInteger {
        const modulus = this.modulus;
        let res = this.value.add(other.value);
        if (res.gteq(modulus)) {
            res = res.sub(modulus);
        }
        return new BigModInteger(res, modulus);
    }

    public sub(other: BigModInteger): BigModInteger {
        const modulus = this.modulus;
        let res = this.value.sub(other.value);
        if (res.sign() === BigIntegerSign.negative) {
            res = res.add(modulus);
        }
        return new BigModInteger(res, modulus);
    }

    public mul(other: BigModInteger): BigModInteger {
        const left = this;
        const right = other;
        const rightLen = right.value.length();
        let acc = BigModInteger.zero(this.modulus);
        let walker: BigModInteger = left;
        for (let bitIndex = 0; bitIndex < rightLen * 8; bitIndex++) {
            if (right.bit(bitIndex)) {
                acc = acc.add(walker);
            }
            walker = walker.double();
        }
        return acc;
    }

    public bit(bitIndex: number): boolean {
        return this.value.bit(bitIndex);
    }

    public double(): BigModInteger {
        const modulus = this.modulus;
        let res = this.value.double();
        if (res.gteq(modulus)) {
            res = res.sub(modulus);
        }
        return new BigModInteger(res, modulus);
    }

    public triple(): BigModInteger {
        return this.add(this).add(this);
    }

    public square(): BigModInteger {
        return this.mul(this);
    }

    public cube(): BigModInteger {
        return this.mul(this).mul(this);
    }

    public negate(): BigModInteger {
        const modulus = this.modulus;
        return new BigModInteger(modulus.sub(this.value), modulus);
    }

    public inverse(): BigModInteger {
        const modulus = this.modulus;
        const raw = BigInteger.euclidExtended(this.value, modulus).x.modAbs(modulus);
        return new BigModInteger(raw, modulus);
    }

    public half(): BigModInteger {
        return new BigModInteger(this.value.half(), this.modulus);
    }

    public odd(): boolean {
        return this.value.odd();
    }

    public eq(other: BigModInteger): boolean {
        return this.value.eq(other.value);
    }

    public zero(): boolean {
        return this.value.zero();
    }

    /**
     * Get bytes count
     */
    public get length8(): number {
        return this.value.length8;
    }

    public static zero(modulus: BigInteger): BigModInteger {
        return new BigModInteger(BigInteger.zero(), modulus);
    }

    public static one(modulus: BigInteger): BigModInteger {
        return new BigModInteger(BigInteger.one(), modulus);
    }

}