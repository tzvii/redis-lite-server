const { Deserializer } = require('../lib/src/data-conversion/Deserializer');

describe('Deserializer', () =>
{
    describe('simpleString', () =>
    {
        test('Input should pass: "+horse\r\n"', () =>
        {
            expect(Deserializer.simpleString('+horse\r\n')).toBe('horse');
        });

        test('Input should pass: "+g3ntl3man\r\n"', () =>
        {
            expect(Deserializer.simpleString('+g3ntl3man\r\n')).toBe('g3ntl3man');
        });

        test('Input should fail: "\nrabbit"', () =>
        {
            expect(() => Deserializer.simpleString('\nrabbit')).toThrow(Error);
        });

        test('Input should fail: "+foo"', () =>
        {
            expect(() => Deserializer.simpleString('+foo')).toThrow(Error);
        });
    });

    describe('error', () =>
    {
        test('Input should pass: ERR', () =>
        {
            const err = '-ERR unknown command "asdf"\r\n';
            expect(Deserializer.error(err)).toBe(err.split('-')[1].split('\r')[0]);
        });

        test('Input should pass: WRONGTYPE', () =>
        {
            const err = "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
            expect(Deserializer.error(err)).toBe(err.split('-')[1].split('\r')[0]);
        });

        test('Input should fail: "ERR"', () =>
        {
            const err = '-ERR unknown command "asdf"';
            expect(() => Deserializer.error(err)).toThrow(Error);
        });

        test('Input should fail: "WRONGTYPE"', () =>
        {
            const err = "WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
            expect(() => Deserializer.error(err)).toThrow(Error);
        });
    });

    describe('integer', () =>
    {
        test('Input should pass: 42', () =>
        {
            expect(Deserializer.integer(':42\r\n')).toBe('42');
        });

        test('Input should pass: 1000', () =>
        {
            expect(Deserializer.integer(':1000\r\n')).toBe('1000');
        });

        test('Input should fail: 15_', () =>
        {
            expect(() => Deserializer.integer(':15')).toThrow(Error);
        });

        test('Input should fail: a12', () =>
        {
            expect(() => Deserializer.integer('a12\r\n')).toThrow(Error);
        });

        test('Input should fail: NaN', () =>
        {
            expect(() => Deserializer.integer(NaN)).toThrow(Error);
        });
    });

    describe('bulkString', () =>
    {
        test('Input should pass:', () =>
        {

        });

        test('Input should pass:', () =>
        {

        });

        test('Input should fail:', () =>
        {

        });

        test('Input should fail:', () =>
        {

        });
    });

    describe('array', () =>
    {
        test('Input should pass', () =>
        {
            const respArr = `*5\r\n$5\r\nhello\r\n:1\r\n:2\r\n:3\r\n$5\r\nworld\r\n`;
            const expectedArr = '["hello","1","2","3","world"]';
            console.log(Deserializer.array(respArr));
            expect(Deserializer.array(respArr)).toBe(expectedArr);
        });

        test('Input should pass', () =>
        {

        });

        test('Input should fail', () =>
        {

        });

        test('Input should fail', () =>
        {

        });
    });
});