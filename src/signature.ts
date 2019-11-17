import { IECurve } from "./../typings/index";
import { BigInteger } from "./math/index";

export default class ECSignature {

    constructor(
        public readonly r: BigInteger,
        public readonly s: BigInteger,
        public readonly curve: IECurve
    ) {
    }

}