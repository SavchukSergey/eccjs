export default function measure(proto: any, funcNames: string[], func: () => void) {
    const backup: {
        [key: string]: () => any
    } = {};
    const stat: {
        [key: string]: number
    } = {};
    const protoMap = proto as {
        [key: string]: () => any
    };
    for (const funcName of funcNames) {
        backup[funcName] = protoMap[funcName];
        protoMap[funcName] = function() {
            stat[funcName] = (stat[funcName] || 0) + 1;
            return backup[funcName].apply(this, arguments);
        };
    }
    try {
        func();
    } finally {
        for (const funcName in backup) {
            if (backup.hasOwnProperty(funcName)) {
                protoMap[funcName] = backup[funcName];
            }
        }
    }
    return stat;
}