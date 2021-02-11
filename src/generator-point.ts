import { IECAffinePoint, IECProjectivePoint } from "../typings";
import { BigInteger } from "./math";
import ECAffinePoint from "./point-affine";
import ECProjectivePoint from "./point-projective";

export class GeneratorPointProjective {

    private readonly powers: IECProjectivePoint[] = [];

    constructor(public readonly value: IECProjectivePoint) {
        this.powers.push(ECProjectivePoint.infinity(value.curve), value);
    }

    public pow2(exp: number): IECProjectivePoint {
        const powers = this.powers;
        while (powers.length <= exp) {
            const last = powers[powers.length - 1];
            powers.push(last.double());
        }
        return powers[exp];
    }

    public mul(k: BigInteger): IECProjectivePoint {
        let acc = ECProjectivePoint.infinity(this.value.curve);
        const len8 = k.length8;
        for (let i = 0; i < len8 * 8; i++) {
            if (k.bit(i)) {
                acc = acc.add(this.pow2(i + 1));
            }
        }
        return acc;
    }

}

export class GeneratorPointAffine {

    private readonly powers: IECAffinePoint[] = [];

    constructor(public readonly value: IECAffinePoint) {
        this.powers.push(ECAffinePoint.infinity(value.curve), value);
    }

    public pow2(exp: number): IECAffinePoint {
        const powers = this.powers;
        while (powers.length <= exp) {
            const last = powers[powers.length - 1];
            powers.push(last.double());
        }
        return powers[exp];
    }

    public mul(k: BigInteger): IECAffinePoint {
        let acc = ECAffinePoint.infinity(this.value.curve);
        const len8 = k.length8;
        for (let i = 0; i < len8 * 8; i++) {
            if (k.bit(i)) {
                acc = acc.add(this.pow2(i + 1));
            }
        }
        return acc;
    }

}