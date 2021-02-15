import { IECAffinePoint, IECPoint, IECProjectivePoint } from "../typings";
import { BigInteger } from "./math";
import ECAffinePoint from "./point-affine";
import ECProjectivePoint from "./point-projective";

export abstract class BaseGeneratorPoint<T extends IECPoint<T>> {

    private readonly powers: T[] = [];
    private readonly mulCache: T[] = [];

    constructor(
        public readonly value: T,
        private readonly zero: T) {
        this.powers.push(value);
    }

    public pow2(exp: number): T {
        const powers = this.powers;
        if (exp < 1) {
            throw new Error("exponents less then 1 are not supported");
        }
        while (powers.length < exp) {
            const last = powers[powers.length - 1];
            powers.push(last.double());
        }
        return powers[exp - 1];
    }

    // public mul(k: BigInteger): T {
    //     let acc = this.zero;
    //     const len8 = k.length8;
    //     for (let i = 0; i < len8 * 8; i++) {
    //         if (k.bit(i)) {
    //             acc = acc.add(this.pow2(i + 1));
    //         }
    //     }
    //     return acc;
    // }

    public mul(k: BigInteger): T {
        let acc = this.zero;
        const len = k.length8 * 8;
        const windowSizeBits = 4;
        const windowSize = 1 << windowSizeBits;
        let bitIndex = 0;
        let shiftIndex = 0;
        const cache = this.mulCache;
        for (let i = 0; i < len; i += windowSizeBits) {
            let windowValue = 0;
            for (let j = 0; j < windowSizeBits; j++) {
                windowValue <<= 1;
                if (k.bit(bitIndex)) {
                    windowValue++;
                }
                bitIndex++;
            }
            const cacheIndex = windowValue + shiftIndex;
            let value = cache[cacheIndex];
            if (!value) {
                value = this.zero;
                for (let j = 0; j < windowSizeBits; j++) {
                    if (k.bit(i + j)) {
                        value = value.add(this.pow2(i + j + 1));
                    }
                }
                cache[cacheIndex] = value;
            }
            acc = acc.add(value);
            shiftIndex += windowSize;
        }
        return acc;
    }
}

export class GeneratorPointProjective extends BaseGeneratorPoint<IECProjectivePoint> {

    constructor(value: IECProjectivePoint) {
        super(value, ECProjectivePoint.infinity(value.curve));
    }

}

export class GeneratorPointAffine extends BaseGeneratorPoint<IECAffinePoint> {

    constructor(value: IECAffinePoint) {
        super(value, ECAffinePoint.infinity(value.curve));
    }

}
