import { IECAffinePoint, IECPrivateKey, IECPublicKey, IECurve, IECurveHex } from "./../typings/index";
import { BigInteger, BigModInteger } from "./math";
import ECAffinePoint from "./point-affine";
import { GeneratorPointProjective } from "./point-generator";
import ECPrivateKey from "./private-key";
import ECPublicKey from "./public-key";

const knownCache: {
    [key: string]: ECurve | undefined
} = {};

function ensureKnown(name: string, factory: () => IECurveHex): ECurve {
    const existing = knownCache[name];
    if (existing) {
        return existing;
    }
    const curve = ECurve.build(factory());
    knownCache[name] = curve;
    return curve;
}

export class ECurve implements IECurve {

    public readonly a: BigModInteger;
    public readonly b: BigModInteger;
    public readonly g: IECAffinePoint;

    public readonly keySize8 = 32;
    public readonly orderSize8 = 32;

    private readonly generatorPoint: GeneratorPointProjective;

    constructor(
        public readonly name: string,
        a: BigInteger,
        b: BigInteger,
        public readonly modulus: BigInteger,
        public readonly order: BigInteger,
        public readonly cofactor: BigInteger,
        gx: BigInteger,
        gy: BigInteger
    ) {
        this.a = new BigModInteger(a.modAbs(modulus), modulus);
        this.b = new BigModInteger(b.modAbs(modulus), modulus);
        this.g = this.createPoint(gx, gy);
        this.generatorPoint = new GeneratorPointProjective(this.g.projective());
    }

    public has(p: IECAffinePoint): boolean {
        if (p.infinity()) return true;

        const left = p.y.square();
        const right = p.x.cube().add(this.a.mul(p.x)).add(this.b);
        return left.eq(right);
    }

    public createPoint(x: BigInteger, y: BigInteger): IECAffinePoint {
        const modulus = this.modulus;
        return new ECAffinePoint(x.modAbs(modulus), y.modAbs(modulus), this);
    }

    public createPrivateKey(d: BigInteger): IECPrivateKey {
        return new ECPrivateKey(d, this);
    }

    public createPublicKey(d: BigInteger): IECPublicKey {
        return new ECPublicKey(this.generatorPoint.mul(d).affine());
    }

    public truncateHash(val: BigInteger): BigInteger {
        const order = this.order;
        while (val.gteq(order)) {
            val = val.half();
        }
        return val;
    }

    public static nistP256(): IECurve {
        return ensureKnown("nistP256", () => ({
            name: "P-256",
            modulus: "ffffffff00000001000000000000000000000000ffffffffffffffffffffffff",
            a: "ffffffff00000001000000000000000000000000fffffffffffffffffffffffc",
            b: "5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b",
            gx: "6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296",
            gy: "4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5",
            order: "ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551",
            cofactor: "1"
        }));
    }

    public static secp256k1(): IECurve {
        return ensureKnown("secp256k1", () => ({
            name: "secp256k1",
            modulus: "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
            a: "00",
            b: "07",
            gx: "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            gy: "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
            order: "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
            cofactor: "1"
        }));
    }

    public static build(info: IECurveHex): ECurve {
        return new ECurve(
            info.name,
            BigInteger.parseUnsignedHex(info.a),
            BigInteger.parseUnsignedHex(info.b),
            BigInteger.parseUnsignedHex(info.modulus),
            BigInteger.parseUnsignedHex(info.order),
            BigInteger.parseUnsignedHex(info.cofactor),
            BigInteger.parseUnsignedHex(info.gx),
            BigInteger.parseUnsignedHex(info.gy)
        );
    }

}
