import { BigInteger, BigModInteger } from "./../src/math";

export interface IECurve {
    readonly name: string;
    readonly g: IECAffinePoint;
    readonly a: BigModInteger;
    readonly b: BigModInteger;
    readonly modulus: BigInteger;
    readonly order: BigInteger;
    readonly cofactor: BigInteger;

    readonly keySize8: number;
    readonly orderSize8: number;

    createPrivateKey(d: BigInteger): IECPrivateKey;
    createPublicKey(d: BigInteger): IECPublicKey;
    createPoint(x: BigInteger, y: BigInteger): IECAffinePoint;
    has(point: IECAffinePoint): boolean;
    truncateHash(val: BigInteger): BigInteger;
}

export interface IECPoint<TPoint> {
    mul(k: BigInteger): TPoint;
    double(): TPoint;
    add(other: TPoint): TPoint;
}

export interface IECAffinePoint extends IECPoint<IECAffinePoint> {
    readonly x: BigModInteger;
    readonly y: BigModInteger;
    readonly curve: IECurve;

    projective(): IECProjectivePoint;

    double(): IECAffinePoint;
    add(other: IECAffinePoint): IECAffinePoint;
    mul(k: BigInteger): IECAffinePoint;
    negate(): IECAffinePoint;

    infinity(): boolean;
    valid(): boolean;

    hex(compress: boolean): string;
}

export interface IECProjectivePoint {
    readonly x: BigModInteger;
    readonly y: BigModInteger;
    readonly z: BigModInteger;
    readonly curve: IECurve;

    affine(): IECAffinePoint;

    double(): IECProjectivePoint;
    add(other: IECProjectivePoint): IECProjectivePoint;
    mul(k: BigInteger): IECProjectivePoint;
    negate(): IECProjectivePoint;

    infinity(): boolean;
    valid(): boolean;
}

export interface IECPublicKey {
    readonly point: IECAffinePoint;
    hex(compress: boolean = true): string;
}

export interface IECPrivateKey {
    readonly d: BigModInteger;
    publicKey(): IECPublicKey;
    sign(message: BigInteger, random: BigInteger): IECSignature | null;
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

export interface IECJwk {
    readonly crv: string;
    readonly kty: "EC";
    readonly x: string;
    readonly y: string;
}

export interface IBezoutIdentity {
    readonly x: BigInteger;
    readonly y: BigInteger;
    readonly a: BigInteger;
    readonly b: BigInteger;
    readonly gcd: BigInteger;
}

export interface IECSignature {
    readonly r: BigInteger;
    readonly s: BigInteger;
    readonly curve: IECurve;
    hex(): string;
}