import { IECPrivateKey, IECPublicKey, IECurve } from "./../typings/index";
import { BigInteger, BigModInteger } from "./math/index";
import ECSignature from "./signature";

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
        const result = this.curve.createPublicKey(this.d.value);
        this.publicKeyCache = result;
        return result;
    }

    private publicKeyCache: IECPublicKey | null = null;

    public sign(message: BigInteger, random: BigInteger): ECSignature | null{
        const truncated = this.curve.truncateHash(message);
        return this.signTruncated(truncated, random);
    }

    private signTruncated(message: BigInteger, random: BigInteger): ECSignature | null {
        const { curve, d } = this;
        const { order } = curve;
        const randomMod = new BigModInteger(random, order);
        const msgMod = new BigModInteger(message, order);
        const p = curve.createPublicKey(randomMod.value).point;
        const r = new BigModInteger(p.x.value.modAbs(order), order);
        if (r.zero()) return null;
        const s = ((msgMod.add(r.mul(d))).mul(randomMod.inverse()));
        if (s.zero()) return null;
        return new ECSignature(r.value, s.value, curve);
    }

}