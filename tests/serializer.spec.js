const { Serializer } = require('../lib/src/data-conversion/Serializer');

describe('Serializer', () =>
{
    describe('simpleString', () =>
    {
        test('Input should pass: "horse"', () =>
        {
            expect(Serializer.simpleString('horse')).toBe('+horse\r\n');
        });

        test('Input should pass: "g3ntl3man"', () =>
        {
            expect(Serializer.simpleString('g3ntl3man')).toBe('+g3ntl3man\r\n');
        });

        test('Input should fail: "\nrabbit"', () =>
        {
            expect(() => Serializer.simpleString('\nrabbit')).toThrow(Error);
        });

        test('Input should fail: "foo\r"', () =>
        {
            expect(() => Serializer.simpleString('foo\r')).toThrow(Error);
        });
    });

    describe('error', () =>
    {
        test('Input should pass: ERR', () =>
        {
            const err = 'ERR unknown command "asdf"';
            expect(Serializer.error(err)).toBe(`-${err}\r\n`);
        });

        test('Input should pass: WRONGTYPE', () =>
        {
            const err = "WRONGTYPE Operation against a key holding the wrong kind of value";
            expect(Serializer.error(err)).toBe(`-${err}\r\n`);
        });

        test('Input should fail: "ERR"', () =>
        {
            const err = 'ERR unknown command\n "asdf"';
            expect(() => Serializer.error(err)).toThrow(Error);
        });

        test('Input should fail: "WRONGTYPE"', () =>
        {
            const err = "WRONGTYPE \rOperation against a key holding the wrong kind of value";
            expect(() => Serializer.error(err)).toThrow(Error);
        });
    });

    describe('integer', () =>
    {
        test('Input should pass: 42', () =>
        {
            expect(Serializer.integer('42')).toBe(':42\r\n');
        });

        test('Input should pass: 1000', () =>
        {
            expect(Serializer.integer('1000')).toBe(':1000\r\n');
        });

        test('Input should fail: 15_', () =>
        {
            expect(() => Serializer.integer('15_')).toThrow(Error);
        });

        test('Input should fail: a12', () =>
        {
            expect(() => Serializer.integer('a12')).toThrow(Error);
        });

        test('Input should fail: NaN', () =>
        {
            expect(() => Serializer.integer(NaN)).toThrow(Error);
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
});