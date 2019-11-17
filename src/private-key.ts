import { BigInteger, BigModInteger } from "./math/index";
import ECPublicKey from "./public-key";
import { IECPrivateKey, IECPublicKey, IECurve } from "./../typings/index";

export default class ECPrivateKey implements IECPrivateKey {

    public readonly d: BigModInteger;

    constructor(
        d: BigInteger,
        public readonly curve: IECurve
    ) {
        this.d = new BigModInteger(d, curve.modulus);
    }

    public publicKey(): IECPublicKey {
        const existing = this.publicKeyCache;
        if (existing) {
            return existing;
        }
        const result = new ECPublicKey(this.curve.g.projective().mul(this.d).affine());
        this.publicKeyCache = result;
        return result;
    }

    private publicKeyCache: IECPublicKey | null = null;

}