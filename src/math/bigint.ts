import { IBezoutIdentity } from "../../typings";
import { base64urldecode, base64urlencode } from "../encoding/base64url";

const hex = "0123456789abcdef";

function parseHexDigit(ch: string) {
    const code = ch.charCodeAt(0);
    if (ch >= "0" && ch <= "9") {
        return code - 48;
    }
    if (ch >= "a" && ch <= "f") {
        return code - "a".charCodeAt(0) + 10;
    }
    if (ch >= "A" && ch <= "F") {
        return code - "A".charCodeAt(0) + 10;
    }
    throw new Error(`Invalid hex digit ${ch}`);
}

function trimHighest(buffer: Uint8Array): Uint8Array {
    if (!buffer.length) return buffer;
    let meaningfullStart = 0;
    while ((meaningfullStart < buffer.length - 1) && (buffer[meaningfullStart] === 0xff && buffer[meaningfullStart + 1] >= 0x80)) {
        meaningfullStart++;
    }
    while ((meaningfullStart < buffer.length - 1) && (buffer[meaningfullStart] === 0x00 && buffer[meaningfullStart + 1] < 0x80)) {
        meaningfullStart++;
    }
    if (meaningfullStart) {
        if (buffer.slice) {
            return buffer.slice(meaningfullStart);
        } else {
            const newBuffer = new Uint8Array(buffer.length - meaningfullStart);
            for (let i = 0; i < newBuffer.length; i++) {
                newBuffer[i] = buffer[i + meaningfullStart];
            }
            return newBuffer;
        }
    }
    return buffer;
}

export const enum BigIntegerSign {
    negative = -1,
    zero = 0,
    positive = 1
}

export default class BigInteger {

    constructor(
        private readonly buffer: Uint8Array
    ) {
    }

    /**
     * Serializes biginteger to big-endian hex string
     * @param length Explicit output length in bytes
     */
    public unsignedHex(length?: number): string {
        const buffer = this.buffer;
        length = length ?? buffer.length;
        if (!length) {
            return "00";
        }
        let res = "";
        for (let i = buffer.length; i < length; i++) {
            res += "00";
        }
        const extra = Math.max(0, buffer.length - length);
        for (let i = extra; i < buffer.length; i++) {
            const bt = buffer[i];
            res += hex.charAt(bt >> 4);
            res += hex.charAt(bt & 0x0f);
        }
        return res;
    }

    public unsignedBase64Url(length = -1): string {
        const data = this.buffer;
        if (length >= 0) {
            const newBuffer = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                newBuffer[newBuffer.length - 1 - i] = i < data.length ? data[data.length - 1 - i] : 0;
            }
            return base64urlencode(newBuffer);
        }
        return base64urlencode(data);
    }

    private ext(): number {
        if (this.buffer[0] >= 0x80) {
            return 0xff;
        }
        return 0x00;
    }

    public sign(): BigIntegerSign {
        const buffer = this.buffer;
        if (buffer[0] >= 0x80) {
            return BigIntegerSign.negative;
        }
        const len = buffer.length;
        for (let i = 0; i < len; i++) {
            if (buffer[i]) return BigIntegerSign.positive;
        }
        return BigIntegerSign.zero;
    }

    /**
     * Check whether current number is greater or equal then the other
     * @param other Number to be compared with
     * @returns true if this number is greater or equal then the other
     */
    public gteq(other: BigInteger): boolean {
        const sign = this.compare(other);
        return sign === BigIntegerSign.zero || sign === BigIntegerSign.positive;
    }

    public eq(other: BigInteger): boolean {
        const sign = this.compare(other);
        return sign === BigIntegerSign.zero;
    }

    public compare(other: BigInteger): BigIntegerSign {
        const left = this;
        const right = other;
        const leftSign = left.sign();
        const rightSign = right.sign();
        if (leftSign > rightSign) return BigIntegerSign.positive;
        if (leftSign < rightSign) return BigIntegerSign.negative;
        const leftLen = left.buffer.length;
        const rightLen = right.buffer.length;
        if (leftLen > rightLen) return BigIntegerSign.positive;
        if (leftLen < rightLen) return BigIntegerSign.negative;
        for (let i = 0; i < leftLen; i++) {
            const leftByte = left.buffer[i];
            const rightByte = right.buffer[i];
            if (leftByte > rightByte) return BigIntegerSign.positive;
            if (leftByte < rightByte) return BigIntegerSign.negative;
        }
        return BigIntegerSign.zero;
    }

    public add(other: BigInteger): BigInteger {
        const leftBuffer = this.buffer;
        const rightBuffer = other.buffer;
        const leftLen = leftBuffer.length;
        const rightLen = rightBuffer.length;
        const extLeft = this.ext();
        const extRight = other.ext();
        const max = Math.max(leftLen, rightLen);
        const res = new Uint8Array(max + 1);
        let leftIndex = leftLen - 1;
        let rightIndex = rightLen - 1;
        let resIndex = res.length - 1;
        let carry = 0;
        while (resIndex >= 0) {
            const left = leftIndex >= 0 ? leftBuffer[leftIndex] : extLeft;
            const right = rightIndex >= 0 ? rightBuffer[rightIndex] : extRight;
            let sum = left + right + carry;
            if (sum >= 256) {
                sum -= 256;
                carry = 1;
            } else {
                carry = 0;
            }
            res[resIndex] = sum;
            leftIndex--;
            rightIndex--;
            resIndex--;
        }
        return new BigInteger(trimHighest(res));
    }

    public sub(other: BigInteger): BigInteger {
        return this.add(other.negate());
    }

    public inc(): BigInteger {
        return this.add(BigInteger.fromValue(1));
    }

    public mul(other: BigInteger): BigInteger {
        const leftSign = this.sign();
        const rightSign = other.sign();
        const left = this.abs();
        const right = other.abs();
        const rightBuffer = other.buffer;
        const rightLen = rightBuffer.length;
        let acc = BigInteger.zero();
        let walker = left;
        for (let bitIndex = 0; bitIndex < rightLen * 8; bitIndex++) {
            if (right.bit(bitIndex)) {
                acc = acc.add(walker);
            }
            walker = walker.double();
        }
        if (leftSign !== rightSign) {
            acc = acc.negate();
        }
        return acc;
    }

    public divRem(divisor: BigInteger): { quotient: BigInteger, reminder: BigInteger } {
        if (divisor.zero()) {
            throw new Error("Division by zero");
        }
        const leftSign = this.sign();
        const rightSign = divisor.sign();

        const left = this.abs();
        const right = divisor.abs();

        let high = BigInteger.zero();
        let quotient = BigInteger.zero();

        const bitLength = left.buffer.length * 8;

        for (let i = 0; i < bitLength; i++) {
            high = high.double();
            if (left.bit(bitLength - 1 - i)) {
                high = high.inc();
            }
            quotient = quotient.double();
            if (high.gteq(right)) {
                high = high.sub(right);
                quotient = quotient.inc();
            }
        }

        return {
            quotient: (leftSign === rightSign) ? quotient : quotient.negate(),
            reminder: (leftSign !== BigIntegerSign.negative) ? high : high.negate()
        };
    }

    public bit(bitIndex: number): boolean {
        const buffer = this.buffer;
        if (bitIndex < 0) {
            return false;
        }
        const byteIndex = bitIndex >> 3;
        if (byteIndex >= buffer.length) {
            return buffer[0] >= 0x80;
        }
        const byte = buffer[buffer.length - byteIndex - 1];
        const mask = 1 << (bitIndex & 0x07);
        return (byte & mask) > 0;
    }

    public length(): number {
        return this.buffer.length;
    }

    /**
     * Get bytes count
     */
    public get length8(): number {
        return this.buffer.length;
    }

    public abs(): BigInteger {
        if (this.sign() === BigIntegerSign.negative) {
            return this.negate();
        }
        return this;
    }

    public negate(): BigInteger {
        const buffer = this.buffer;
        const sourceLength = buffer.length;
        const extLeft = this.ext();
        const res = new Uint8Array(sourceLength + 1);
        let leftIndex = sourceLength - 1;
        let resIndex = res.length - 1;
        let carry = 1;
        while (resIndex >= 0) {
            const left = 255 - (leftIndex >= 0 ? buffer[leftIndex] : extLeft);
            let sum = left + carry;
            if (sum >= 256) {
                sum -= 256;
                carry = 1;
            } else {
                carry = 0;
            }
            res[resIndex] = sum;
            leftIndex--;
            resIndex--;
        }
        return new BigInteger(trimHighest(res));
    }

    public square(): BigInteger {
        return this.mul(this);
    }

    public cube(): BigInteger {
        return this.mul(this).mul(this);
    }

    public double(): BigInteger {
        const buffer = this.buffer;
        const len = buffer.length;
        const ext = this.ext();
        const target = new Uint8Array(len + 1);
        let index = target.length - 1;
        let carry = 0;
        while (index >= 0) {
            const bt = index >= 1 ? buffer[index - 1] : ext;
            let sum = bt + bt + carry;
            if (sum >= 256) {
                sum -= 256;
                carry = 1;
            } else {
                carry = 0;
            }
            target[index] = sum;
            index--;
        }
        return new BigInteger(trimHighest(target));
    }

    public triple(): BigInteger {
        return this.double().add(this);
    }

    public half(): BigInteger {
        if (this.zero()) {
            return this;
        }
        const buffer = this.buffer;
        const len = buffer.length;
        const target = new Uint8Array(len);
        let carry = buffer[0] >= 0x80 ? 0x80 : 0;
        for (let i = 0; i < len; i++) {
            const bt = buffer[i];
            target[i] = (bt >> 1) + carry;
            carry = bt & 1 ? 0x80 : 0;
        }
        return new BigInteger(trimHighest(target));
    }

    public modInverse(modulus: BigInteger): BigInteger {
        return BigInteger.euclidExtended(this.modAbs(modulus), modulus).x.modAbs(modulus);
    }

    public modAbs(modulus: BigInteger): BigInteger {
        const reminder = this.mod(modulus);
        if (reminder.sign() === BigIntegerSign.negative) {
            return reminder.add(modulus);
        }
        return reminder;
    }

    public mod(modulus: BigInteger): BigInteger {
        return this.divRem(modulus).reminder;
    }

    public zero(): boolean {
        return this.sign() === BigIntegerSign.zero;
    }

    public odd(): boolean {
        const buffer = this.buffer;
        const len = buffer.length;
        return ((len && buffer[len - 1]) & 0x01) > 0;
    }

    public even(): boolean {
        const buffer = this.buffer;
        const len = buffer.length;
        return ((len && buffer[len - 1]) & 0x01) === 0;
    }

    public static zero(): BigInteger {
        return new BigInteger(new Uint8Array(1));
    }

    public static one(): BigInteger {
        const data = new Uint8Array(1);
        data[0] = 1;
        return new BigInteger(data);
    }

    public static fromValue(value: number): BigInteger {
        const original = value;
        value = Math.abs(value);

        let size = 1;
        let sizeVal = value;
        while (sizeVal) {
            sizeVal = sizeVal >> 8;
            size++;
        }
        const res = new Uint8Array(size);
        for (let i = size - 1; i >= 0; i--) {
            const bt = value & 0xff;
            res[i] = bt;
            value = value >> 8;
        }
        const result = new BigInteger(trimHighest(res));
        return original >= 0 ? result : result.negate();
    }

    public static parseUnsignedBase64Url(value: string): BigInteger {
        const buffer = base64urldecode(value);
        if (buffer[0] < 0x80) {
            return new BigInteger(buffer);
        }
        const newBuffer = new Uint8Array(buffer.length + 1);
        for (let i = 0; i < buffer.length; i++) {
            newBuffer[i + 1] = buffer[i];
        }
        newBuffer[0] = 0;
        return new BigInteger(newBuffer);
    }

    public static parseUnsignedHex(value: string): BigInteger {
        const size = (value.length + 1) >> 1;
        const res = new Uint8Array(size + 1);
        let valIndex = value.length - 2;
        for (let i = size - 1; i >= 0; i--) {
            const high = parseHexDigit(value.charAt(valIndex) || "0");
            const low = parseHexDigit(value.charAt(valIndex + 1) || "0");
            const bt = high * 16 + low;
            res[i + 1] = bt;
            valIndex -= 2;
        }
        res[0] = 0;
        return new BigInteger(trimHighest(res));
    }

    public static euclidExtended(a: BigInteger, b: BigInteger): IBezoutIdentity {
        let s0 = BigInteger.one();
        let t0 = BigInteger.zero();
        let s1 = BigInteger.zero();
        let t1 = BigInteger.one();
        let r0 = a;
        let r1 = b;

        while (!r1.zero()) {
            const { quotient, reminder } = r0.divRem(r1);
            const s2 = s0.sub(quotient.mul(s1));
            const t2 = t0.sub(quotient.mul(t1));
            s0 = s1;
            s1 = s2;
            t0 = t1;
            t1 = t2;
            r0 = r1;
            r1 = reminder;
        }
        return {
            a,
            b,
            x: s0,
            y: t0,
            gcd: a.mul(s0).add(b.mul(t0))
        };
    }

}