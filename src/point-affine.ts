import { IECAffinePoint, IECProjectivePoint, IECurve } from "./../typings/index";
import { BigModInteger } from "./math/index";
import ECProjectivePoint from "./point-projective";

export default class ECAffinePoint implements IECAffinePoint {

    constructor(
        public readonly x: BigModInteger,
        public readonly y: BigModInteger,
        public readonly curve: IECurve
    ) {
    }

    public projective(): IECProjectivePoint {
        const curve = this.curve;
        return new ECProjectivePoint(this.x, this.y, BigModInteger.one(curve.modulus), curve);
    }

    public valid(): boolean {
        if (this.infinity()) return true;

        const { x, y, curve } = this;
        const left = y.mul(y);
        const right = x.mul(x.square()).add(curve.a.mul(x).add(curve.b));
        return left.eq(right);
    }

    public double(): IECAffinePoint {
        return this.add(this);
    }

    public add(other: IECAffinePoint): IECAffinePoint {
        const left = this;
        const right = other;

        if (left.infinity()) return right;
        if (right.infinity()) return left;

        const curve = left.curve;

        const dx = right.x.sub(left.x);
        const dy = right.y.sub(left.y);

        if (dx.zero() && !dy.zero()) {
            return ECAffinePoint.infinity(curve);
        }

        const mfull = dx.zero() ?
            (left.x.square().triple().add(curve.a)).mul((left.y.double().inverse())) :
            (dy.mul(dx.inverse()));
        const m = mfull;

        const rx = m.square().sub(left.x).sub(right.x);
        const ry = m.mul(left.x.sub(rx)).sub(left.y);

        return new ECAffinePoint(rx, ry, curve);
    }

    public mul(k: BigModInteger): IECAffinePoint {
        let acc = ECAffinePoint.infinity(this.curve);
        let add: IECAffinePoint = this;
        const len8 = k.length8;
        for (let i = 0; i < len8 * 8; i++) {
            if (k.bit(i)) {
                acc = acc.add(add);
            }
            add = add.double();
        }
        return acc;

    }

    public negate(): IECAffinePoint {
        return new ECAffinePoint(this.x, this.y.negate(), this.curve);
    }

    public hex(compress = true): string {
        if (this.infinity()) {
            return "00";
        }
        const keySize8 = this.curve.keySize8;
        if (compress) {
            return (this.y.even() ? "02" : "03") + this.x.unsignedHex(keySize8);
        }
        return `04${this.x.unsignedHex(keySize8)}${this.y.unsignedHex(keySize8)}`;
    }

    public infinity(): boolean {
        return this.x.zero() && this.y.zero();
    }

    public static infinity(curve: IECurve): IECAffinePoint {
        const zero = BigModInteger.zero(curve.modulus);
        return new ECAffinePoint(zero, zero, curve);
    }
}
