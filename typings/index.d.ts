import { BigInteger, BigModInteger } from "./../src/math";

export interface IECurve {
    readonly name: string;
    readonly g: IECAffinePoint;
    readonly a: BigModInteger;
    readonly b: BigModInteger;
    readonly modulus: BigInteger;
    readonly order: BigInteger;
    readonly cofactor: BigInteger;

    createPrivateKey(d: BigInteger): IECPrivateKey;
    createPoint(x: BigInteger, y: BigInteger): IECAffinePoint;
    has(point: IECAffinePoint): boolean;
}

export interface IECAffinePoint {
    readonly x: BigModInteger;
    readonly y: BigModInteger;
    readonly curve: IECurve;

    projective(): IECProjectivePoint;

    double(): IECAffinePoint;
    add(other: IECAffinePoint): IECAffinePoint;
    mul(k: BigModInteger): IECAffinePoint;
    negate(): IECAffinePoint;

    infinity(): boolean;
    valid(): boolean;
}

export interface IECProjectivePoint {
    readonly x: BigModInteger;
    readonly y: BigModInteger;
    readonly z: BigModInteger;
    readonly curve: IECurve;

    affine(): IECAffinePoint;

    double(): IECProjectivePoint;
    add(other: IECProjectivePoint): IECProjectivePoint;
    mul(k: BigModInteger): IECProjectivePoint;
    negate(): IECProjectivePoint;

    infinity(): boolean;
    valid(): boolean;
}

export interface IECPublicKey {
    readonly point: IECAffinePoint;
}

export interface IECPrivateKey {
    readonly d: BigModInteger;
    publicKey(): IECPublicKey;
}

export interface IECurveHex {
    readonly name: string;
    readonly modulus: string;
    readonly a: string;
    readonly b: string;
    readonly gx: string;
    readonly gy: string;
    readonly order: string;
    readonly cofactor: string;
}
