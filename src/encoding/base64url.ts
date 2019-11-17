const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function decodeDigit(ch: string): number {
    const code = ch.charCodeAt(0);
    if (ch >= "A" && ch <= "Z") {
        return code - "A".charCodeAt(0);
    }
    if (ch >= "a" && ch <= "z") {
        return code - "a".charCodeAt(0) + 26;
    }
    if (ch >= "0" && ch <= "9") {
        return code - 48 + 52;
    }
    if (ch === "-") {
        return 62;
    }
    if (ch === "_") {
        return 63;
    }
    throw new Error(`Invalid base64url digit ${ch}`);
}

export function base64urlencode(source: Uint8Array): string {
    const len = source.length;
    let res = "";
    for (let i = 0; i < len;) {
        const f = i < len;
        const src1 = f ? source[i++] : 0;
        const s = i < len;
        const src2 = s ? source[i++] : 0;
        const t = i < len;
        const src3 = t ? source[i++] : 0;
        const src = (((src1 << 8) + src2) << 8) + src3;
        const bt1 = (src >> 18) & 0x3f;
        const bt2 = (src >> 12) & 0x3f;
        const bt3 = (src >> 6) & 0x3f;
        const bt4 = (src >> 0) & 0x3f;
        if (f) {
            res += alphabet.charAt(bt1);
            res += alphabet.charAt(bt2);
            if (s) {
                res += alphabet.charAt(bt3);
                if (t) {
                    res += alphabet.charAt(bt4);
                }
            }
        }
    }
    return res;
}

export function base64urldecode(source: string): Uint8Array {
    const tail = source.length & 0x03;
    const size = ((source.length - tail) >> 2) * 3 + (tail > 0 ? 1 : 0) + (tail > 2 ? 1 : 0) + (tail > 3 ? 1 : 0);
    const res = new Uint8Array(size);
    let bitIndex = 0;
    let byteIndex = 0;

    for (let i = 0; i < size; i++) {
        let bt = 0;
        for (let left = 8; left > 0;) {
            const availableBits = 6 - bitIndex;
            const toBeRead = Math.min(left, availableBits);
            const mask = (1 << availableBits) - 1;
            const raw = decodeDigit(source.charAt(byteIndex) || "A") & mask;
            const data = raw >> (availableBits - toBeRead);
            bt = (bt << toBeRead) + data;
            bitIndex += toBeRead;
            if (bitIndex >= 6) {
                bitIndex -= 6;
                byteIndex++;
            }
            left -= toBeRead;
        }
        res[i] = bt;
    }
    return res;
}
