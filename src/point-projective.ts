import { IECAffinePoint, IECProjectivePoint, IECurve } from "./../typings/index";
import { BigInteger, BigModInteger } from "./math";
import ECAffinePoint from "./point-affine";

export default class ECProjectivePoint implements IECProjectivePoint {

    public readonly x: BigModInteger;
    public readonly y: BigModInteger;
    public readonly z: BigModInteger;

    constructor(
        x: BigInteger,
        y: BigInteger,
        z: BigInteger,
        public readonly curve: IECurve
    ) {
        this.x = new BigModInteger(x, curve.modulus);
        this.y = new BigModInteger(y, curve.modulus);
        this.z = new BigModInteger(z, curve.modulus);
    }

    public affine(): IECAffinePoint {
        const curve = this.curve;
        const div = this.z.inverse();
        return new ECAffinePoint(
            this.x.mul(div).value,
            this.y.mul(div).value,
            curve);
    }

    public valid(): boolean {
        return this.affine().valid();
    }

    public double(): IECProjectivePoint {
        const { x, y, z, curve } = this;
        if (y.zero()) {
            return ECProjectivePoint.infinity(curve);
        }
        const t = x.square().triple().add(curve.a.mul(z.square()));

        const u = y.mul(z).double();
        const uy = u.mul(y);
        const v = x.mul(uy).double();
        const w = t.square().sub(v.double());

        const x2 = u.mul(w);
        const y2 = t.mul(v.sub(w)).sub(uy.square().double());
        const z2 = u.cube();
        return new ECProjectivePoint(x2.value, y2.value, z2.value, curve);
    }

    public add(other: IECProjectivePoint): IECProjectivePoint {
        const left = this;
        const right = other;

        if (left.infinity()) return right;
        if (right.infinity()) return left;

        const curve = left.curve;

        const t0 = left.y.mul(right.z);
        const t1 = right.y.mul(left.z);
        const u0 = left.x.mul(right.z);
        const u1 = right.x.mul(left.z);

        const t = t0.sub(t1);
        const u = u0.sub(u1);

        if (u.zero()) {
            if (t.zero()) {
                return this.double();
            } else {
                return ECProjectivePoint.infinity(curve);
            }
        }

        const u2 = u.square();
        const u3 = u.mul(u2);

        const t2 = t.square();

        const v = left.z.mul(right.z);
        const w = t2.mul(v).sub(u2.mul(u0.add(u1)));

        const x2 = u.mul(w);
        const y2 = t.mul(u0.mul(u2).sub(w)).sub(t0.mul(u3));
        const z2 = u3.mul(v);

        return new ECProjectivePoint(x2.value, y2.value, z2.value, curve);
    }

    public mul(k: BigInteger): IECProjectivePoint {
        let acc = ECProjectivePoint.infinity(this.curve);
        let add: IECProjectivePoint = this;
        const len8 = k.length8;
        for (let i = 0; i < len8 * 8; i++) {
            if (k.bit(i)) {
                acc = acc.add(add);
            }
            add = add.double();
        }
        return acc;
    }

    public negate(): ECProjectivePoint {
        return new ECProjectivePoint(this.x.value, this.y.negate().value, this.z.value, this.curve);
    }

    public infinity(): boolean {
        return this.x.zero() && this.y.zero();
    }

    public static infinity(curve: IECurve): IECProjectivePoint {
        const zero = BigInteger.zero();
        return new ECProjectivePoint(zero, zero, zero, curve);
    }
}