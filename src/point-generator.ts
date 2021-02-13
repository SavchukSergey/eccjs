import { IECAffinePoint, IECPoint, IECProjectivePoint } from "../typings";
import { BigInteger } from "./math";
import ECAffinePoint from "./point-affine";
import ECProjectivePoint from "./point-projective";

export abstract class BaseGeneratorPoint<T extends IECPoint<T>> {

    private readonly powers: T[] = [];

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

    public mul(k: BigInteger): T {
        let acc = this.zero;
        const len8 = k.length8;
        for (let i = 0; i < len8 * 8; i++) {
            if (k.bit(i)) {
                acc = acc.add(this.pow2(i + 1));
            }
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
