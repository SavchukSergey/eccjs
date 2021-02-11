import { IECSignature, IECurve } from "./../typings/index";
import { BigInteger } from "./math/index";

export default class ECSignature implements IECSignature {

    constructor(
        public readonly r: BigInteger,
        public readonly s: BigInteger,
        public readonly curve: IECurve
    ) {
    }

    public hexString(): string {
        const { r, s } = this;
        const order8 = 32; // todo
        return `${r.unsignedHex(order8)}${s.unsignedHex(order8)}`;
    }

}