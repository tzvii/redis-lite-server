import { RESPFormat } from "../maps/RESPFormat";
import { RESPPrefix } from "../maps/RESPPrefix";

export class Deserializer
{
    public static simpleString(respString: string): string
    {
        if (!RESPFormat.simpleString.test(respString)) 
        {
            const err = 'Invalid RESP format for simple string.';
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return respString.slice(1, respString.indexOf('\r\n'));
    }

    public static error(respString: string): string
    {
        if (!RESPFormat.error.test(respString)) 
        {
            const err = 'Invalid RESP format for error.';
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return respString.slice(1, respString.indexOf('\r\n'));
    }

    public static integer(respString: string): number
    {
        if (!RESPFormat.integer.test(respString)) 
        {
            const err = 'Invalid RESP format for integer.';
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return parseInt(respString.slice(1, respString.indexOf('\r\n')));
    }

    public static bulkString(respString: string): string
    {
        if (!RESPFormat.bulkString.test(respString)) 
        {
            const err = 'Invalid RESP format for bulk string.';
            console.error(`Error: ${err}`);
            throw new Error(err);
        }

        const length = parseInt(respString.slice(1, respString.indexOf('\r\n', 1)));
        const data = respString.split('\r\n')[1];

        if (data.length !== length) 
        {
            const err = `Integer length (${length}) does not equal length of data (${data.length}).`;
            console.error(`Error: ${err}`);
            throw new Error(err);
        }
        return respString.split('\r\n')[1];
    }

    public static array(respString: string): string
    {
        if (!RESPFormat.array.test(respString)) 
        {
            const err = 'Invalid RESP format for array.';
            console.error(`Error: ${err}`);
            throw new Error(err);
        }

        let length: number = parseInt(respString[1]);
        let dummyStr: string = respString.slice(respString.indexOf('\r\n') + 2);
        const respArr: string[] = [];

        while (length-- > 0) 
        {
            if (/^[+-:$*]/.test(dummyStr)) 
            {
                let endIndex = dummyStr.indexOf('\r\n') + 2;
                if (/^[$]/.test(dummyStr))
                    endIndex += dummyStr.slice(endIndex).indexOf('\r\n') + 2;
                const deserializedStr = Deserializer.map(dummyStr.slice(0, endIndex));
                respArr.push(deserializedStr);
                dummyStr = dummyStr.slice(endIndex);
            }
            else 
            {
                const err = "Invalid RESP format";
                console.error(err);
                throw new Error(err);
            }
        }
        return JSON.stringify(respArr);
    }

    public static map(respStr: string): any
    {
        switch(respStr[0])
        {
            case RESPPrefix.plus:
                return Deserializer.simpleString(respStr);
            case RESPPrefix.minus:
                return Deserializer.error(respStr);
            case RESPPrefix.colon:
                return Deserializer.integer(respStr);
            case RESPPrefix.dollar:
                return Deserializer.bulkString(respStr);
            case RESPPrefix.asterisk:
                return Deserializer.array(respStr);
        }
    }
}