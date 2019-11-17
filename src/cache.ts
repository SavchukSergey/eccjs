import { BigInteger, BigModInteger } from "./math/index";;
import { ECurve } from "./curve";
import ECAffinePoint from "./point-affine";
import ECProjectivePoint from "./point-projective";
import { IECAffinePoint, IECProjectivePoint, IECurve } from "./../typings/index";

export class ECurveCached extends ECurve {

    public readonly g: IECAffinePoint;

    constructor(
        inner: IECurve,
        cache: IPointCacheAccess
    ) {
        super(inner.name, inner.a.value, inner.b.value, inner.modulus, inner.order, inner.cofactor, inner.g.x.value, inner.g.y.value)
        this.g = new ECAffinePointCached(this.g, cache);
    }

}

export class ECProjectivePointCached extends ECProjectivePoint {

    constructor(
        inner: IECProjectivePoint,
        private readonly cache: IPointCacheAccess
    ) {
        super(inner.x, inner.y, inner.z, inner.curve);
    }

    public double(): IECProjectivePoint {
        const cacheAccess = this.cache.deriveDouble();
        const cache = cacheAccess.getProjective();
        if (cache) {
            return new ECProjectivePointCached(cache, cacheAccess);
        } else {
            const raw = super.double();
            cacheAccess.setProjective(raw);
            return new ECProjectivePointCached(raw, cacheAccess);
        }
    }
}

export class ECAffinePointCached extends ECAffinePoint {

    constructor(
        inner: IECAffinePoint,
        private readonly cache: IPointCacheAccess
    ) {
        super(inner.x, inner.y, inner.curve);
    }

    public projective(): IECProjectivePoint {
        const cacheAccess = this.cache.derive("projective");
        const cache = cacheAccess.getProjective();
        if (cache) {
            return new ECProjectivePointCached(cache, cacheAccess);
        } else {
            const raw = super.projective();
            cacheAccess.setProjective(raw);
            return new ECProjectivePointCached(raw, cacheAccess);
        }
    }

    public double(): IECAffinePoint {
        const cacheAccess = this.cache.deriveDouble();
        const cache = cacheAccess.getAffine();
        if (cache) {
            return new ECAffinePointCached(cache, cacheAccess);
        } else {
            const raw = super.double();
            cacheAccess.setAffine(raw);
            return new ECAffinePointCached(raw, cacheAccess);
        }
    }
}

export class LocalStorageCache implements ICacheAccess {

    public derive(key: string): ICacheAccess {
        return new LocalStorageCache(`${this.key}.${key}`);
    }

    public navigate(key: string): ICacheAccess {
        return new LocalStorageCache(key);
    }

    public get(): string | null {
        return window.localStorage.getItem(this.key);
    }

    public set(val: string | null): void {
        if (val) {
            window.localStorage.setItem(this.key, val);
        } else {
            window.localStorage.removeItem(this.key);
        }
    }

    constructor(
        public readonly key: string
    ) {
    }

}

export class PointCacheAccess implements IPointCacheAccess {

    public derive(key: string): IPointCacheAccess {
        return new PointCacheAccess(this.cache.derive(key), this.curve);
    }

    public deriveDouble(): IPointCacheAccess {
        const re = /<<(\d+)$/;
        let key = this.cache.key;
        const match = key.match(re);
        if (match) {
            key = key.substr(0, key.length - match[0].length);
            const shift = parseInt(match[1], 10) + 1;
            key += `<<${shift}`;
            return new PointCacheAccess(this.cache.navigate(key), this.curve);
        } else {
            return new PointCacheAccess(this.cache.navigate(key + "<<1"), this.curve);
        }
    }

    public getProjective(): IECProjectivePoint | null {
        const cache = this.cache.get();
        if (cache) {
            const parts = cache.split("|");
            const x = BigInteger.parseUnsignedBase64Url(parts[0]);
            const y = BigInteger.parseUnsignedBase64Url(parts[1]);
            const z = BigInteger.parseUnsignedBase64Url(parts[2]);
            const modulus = this.curve.modulus;
            return new ECProjectivePoint(
                new BigModInteger(x, modulus),
                new BigModInteger(y, modulus),
                new BigModInteger(z, modulus),
                this.curve
            );
        }
        return null;
    }

    public setProjective(val: IECProjectivePoint | null): void {
        if (val) {
            const str = `${val.x.unsignedBase64Url()}|${val.y.unsignedBase64Url()}|${val.z.unsignedBase64Url()}`;
            this.cache.set(str);
        } else {
            this.cache.set(null);
        }
    }

    public getAffine(): IECAffinePoint | null {
        const cache = this.cache.get();
        if (cache) {
            const parts = cache.split("|");
            const x = BigInteger.parseUnsignedBase64Url(parts[0]);
            const y = BigInteger.parseUnsignedBase64Url(parts[1]);
            const modulus = this.curve.modulus;
            return new ECAffinePoint(
                new BigModInteger(x, modulus),
                new BigModInteger(y, modulus),
                this.curve
            );
        }
        return null;
    }

    public setAffine(val: IECAffinePoint | null): void {
        if (val) {
            const str = `${val.x.unsignedBase64Url()}|${val.y.unsignedBase64Url()}}`;
            this.cache.set(str);
        } else {
            this.cache.set(null);
        }
    }

    constructor(
        private readonly cache: ICacheAccess,
        private readonly curve: IECurve
    ) {
    }
}

interface ICacheAccess {
    readonly key: string;
    navigate(key: string): ICacheAccess;
    derive(key: string): ICacheAccess;
    get(): string | null;
    set(val: string | null): void;

}

interface IPointCacheAccess {
    derive(key: string): IPointCacheAccess;
    deriveDouble(): IPointCacheAccess;
    getProjective(): IECProjectivePoint | null;
    setProjective(val: IECProjectivePoint): void;
    getAffine(): IECAffinePoint | null;
    setAffine(val: IECAffinePoint): void;
}
