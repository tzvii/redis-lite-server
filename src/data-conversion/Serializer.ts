export class Serializer
{
    public static simpleString(data: string): string
    {
        if (/[\n\r]/.test(data)) {
            const err = "Invalid simple string input.";
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return `+${data}\r\n`;
    }

    public static error(data: string): string
    {
        if (/[\n\r]/.test(data)) {
            const err = "Invalid error input.";
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return `-${data}\r\n`;
    }

    public static integer(data: string): string
    {
        if (!/^[+-]?\d+$/.test(data)) {
            const err = "Invalid integer input.";
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return `:${data}\r\n`;
    }

    public static bulkString(data: string): string
    {
        if (/[\n\r]/.test(data)) {
            const err = "Invalid bulk string input.";
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return `$${data.length}\r\n${data}\r\n`;
    }

    public static bulkStringTest(data: string): string
    {
        return `$${data.length}\r\n${data}\r\n`;
    }

    public static array(data: string[]): string
    {
        try
        {
            if (!Array.isArray(data))
            {
                const err = "Invalid Array input.";
                console.error(`Error: ${err}`);
                throw new Error(err);
            }
        }
        catch (err)
        {
            console.error(err);
            throw new Error(err);
        }

        return data.reduce((acc, cur) =>  acc += parseIncomingValue(cur), `*${data.length}\r\n`);
    }
}

export function parseIncomingValue(value: string): string
{
    if (!isNaN(parseInt(value)))
        return Serializer.integer(value);
    else
        return Serializer.bulkString(value);
}