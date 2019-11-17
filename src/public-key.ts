import { IECAffinePoint, IECPublicKey } from "./../typings/index";

export default class ECPublicKey implements IECPublicKey {

    constructor(
        public readonly point: IECAffinePoint
    ) {
    }

    public jwk() {
        const point = this.point;
        return {
            crv: this.point.curve.name,
            kty: "EC",
            x: point.x.unsignedBase64Url(),
            y: point.y.unsignedBase64Url()
        };
    }

}