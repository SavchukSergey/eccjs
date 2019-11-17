import { BigModInteger } from "./math/index";
import ECAffinePoint from "./point-affine";
import { IECAffinePoint, IECProjectivePoint, IECurve } from "./../typings/index";

export default class ECProjectivePoint implements IECProjectivePoint {

    constructor(
        public readonly x: BigModInteger,
        public readonly y: BigModInteger,
        public readonly z: BigModInteger,
        public readonly curve: IECurve
    ) {
    }

    public affine(): IECAffinePoint {
        const curve = this.curve;
        const div = this.z.inverse();
        return new ECAffinePoint(
            this.x.mul(div),
            this.y.mul(div),
            curve);
    }

    public valid(): boolean {
        return this.affine().valid();
    }

    public double(): IECProjectivePoint {
        if (this.y.zero()) {
            return ECProjectivePoint.infinity(this.curve);
        }
        const { x, y, z, curve } = this;
        const t = x.square().triple().add(curve.a.mul(z.square()));

        const u = y.mul(z).double();
        const uy = u.mul(y);
        const v = x.mul(uy).double();
        const w = t.square().sub(v.double());

        const x2 = u.mul(w);
        const y2 = t.mul(v.sub(w)).sub(uy.square().double());
        const z2 = u.cube();
        return new ECProjectivePoint(x2, y2, z2, curve);
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

        return new ECProjectivePoint(x2, y2, z2, curve);
    }

    public mul(k: BigModInteger): IECProjectivePoint {
        let acc = ECProjectivePoint.infinity(this.curve);
        let add: IECProjectivePoint = this;
        while (!k.zero()) {
            if (k.odd()) acc = acc.add(add);
            add = add.double();
            k = k.half();
        }
        return acc;
    }

    public negate(): ECProjectivePoint {
        return new ECProjectivePoint(this.x, this.y.negate(), this.z, this.curve);
    }

    public infinity(): boolean {
        return this.x.zero() && this.y.zero();
    }

    public static infinity(curve: IECurve): IECProjectivePoint {
        const zero = BigModInteger.zero(curve.modulus);
        return new ECProjectivePoint(zero, zero, zero, curve);
    }
}