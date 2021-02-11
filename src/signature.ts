import { IECSignature, IECurve } from "./../typings/index";
import { BigInteger } from "./math/index";

export default class ECSignature implements IECSignature {

    constructor(
        public readonly r: BigInteger,
        public readonly s: BigInteger,
        public readonly curve: IECurve
    ) {
    }

    public hex(): string {
        const { r, s, curve } = this;
        const order8 = curve.orderSize8;
        return `${r.unsignedHex(order8)}${s.unsignedHex(order8)}`;
    }

}