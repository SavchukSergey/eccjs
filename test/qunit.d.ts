interface IQUnitStatic {

    test(name: string, callback: IQUnitCallback);

    module(name: string);

    module(name: string, callback: () => void);

}

interface IQUnitAssert {

    ok(state: boolean, msg: string);

    equal(actual: string, expected: string, msg?: string): void;
    
    equal(actual: number, expected: number, msg: string): void;

    equal(actual: boolean, expected: boolean, msg?: string): void;

    equal<T>(actual: T, expected: T, msg: string);
    
    throws(fund: () => void, msg?: string);

}

interface IQUnitCallback {
    (assert: IQUnitAssert);
}

declare const QUnit: IQUnitStatic;
