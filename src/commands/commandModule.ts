import * as _ from 'lodash';
import { JSONTools } from "../common/JSONTools";
import { Deserializer } from "../data-conversion/Deserializer";
import { Serializer, parseIncomingValue } from "../data-conversion/Serializer";
import { cachedData, saveData } from "../db/redis-lite-db";
import { RedisValue } from "../types/RedisValue";
import { RESPFormat } from '../maps/RESPFormat';

// TODO: should throw errors, not return just the message

export default class CommandModule 
{
    public static ping(): string 
    {
        return "PONG";
    }

    public static echo(...args: string[]): string 
    {
        if (args.length === 0)
            return `ERR invalid 'echo'`;

        return args.join(' ');
    }

    public static exists(...args: string[]): string 
    {
        const count = args.reduce((acc, cur) => 
        {
            if (cur in cachedData) acc++;
            return acc;
        }, 0);

        return `(integer) ${count}`;
    }

    public static set(key: string, value: string, expiryUnit?: ExpiryTimeUnit, timeUnits?: string): string 
    {
        if (!key || !value)
            return `ERR invalid command: SET ${key} ${value}`;

        CommandModule.insertRedisKey(key, value, expiryUnit, timeUnits);

        return "OK";
    }

    public static get(key: string): string 
    {
        if (!key || !(key in cachedData))
            return '(nil)';

        const redisValue: RedisValue = CommandModule.extractKeyValue(key);

        if (redisValue?.ttl && redisValue.ttl <= Date.now()) 
        {
            delete cachedData[key];
            return '(nil)';
        }
        
        return Deserializer.map(redisValue.data);
    }

    public static del(key: string): string 
    {
        if (!key || !(key in cachedData))
            return `ERR invalid arguments`;

        delete cachedData[key];

        return "OK";
    }

    public static listKeys(): string 
    {
        if (_.isEmpty(cachedData))
            return '(nil)';

        const keysIter = Object.keys(cachedData).entries();
        let str: string = '';
        for (const [index, key] of keysIter)
            str += `${index + 1}) "${key}"\n`;
        return str.slice(0, -1);
    }

    public static buildTTL(expiryUnit: ExpiryTimeUnit, timeUnits: number): number 
    {
        const currTime = Date.now();

        switch (expiryUnit) 
        {
            case "EX":
            case "ex":
                return currTime + (timeUnits * 1_000);
            case "PX":
            case "px":
                return currTime + timeUnits;
            case "EXAT":
            case "exat":
                return timeUnits * 1_000;
            case "PXAT":
            case "pxat":
                return timeUnits;
            default:
                return null;
        }
    }

    public static incr(key: string): string 
    {
        if (!key)
            return 'ERR invalid arguments';
        if (!(key in cachedData))
            return CommandModule.set(key, '1');

        const value = parseInt(cachedData[key]);
        if (!(typeof value === 'number'))
            return '(error) value is not an integer';
        else 
        {
            const redisVal: RedisValue = JSONTools.parse(cachedData[key]);
            const incrementedVal = Deserializer.integer(redisVal.data) + 1;
            redisVal.data = Serializer.integer(incrementedVal.toString());
            cachedData[key] = JSONTools.stringify(redisVal);
            return `(integer) ${incrementedVal}`;
        }
    }

    public static decr(key: string): string 
    {
        if (!key)
            return 'ERR invalid arguments';
        if (!(key in cachedData))
            return CommandModule.set(key, '1');

        const value = parseInt(cachedData[key]);
        if (!(typeof value === 'number'))
            return '(error) value is not an integer';
        else 
        {
            const redisVal: RedisValue = JSONTools.parse(cachedData[key]);
            const decrementedVal = Deserializer.integer(redisVal.data) + (-1);
            redisVal.data = Serializer.integer(decrementedVal.toString());
            cachedData[key] = JSONTools.stringify(redisVal);
            return `(integer) ${decrementedVal}`;
        }
    }

    private static insertRedisKey(key: string, value: string, expiryUnit?: ExpiryTimeUnit, timeUnits?: string): void 
    {
        const redisValue: RedisValue = 
        {
            data: parseIncomingValue(value),
            ...(expiryUnit && timeUnits && { ttl: CommandModule.buildTTL(expiryUnit, Number(timeUnits)) }),
        };
        cachedData[key] = JSONTools.stringify(redisValue);
    }

    private static insertRedisArray(key: string, ...args: string[]): void
    {
        const serializedData = Serializer.array(args);
        const redisValue: RedisValue =
        {
            data: serializedData
        };
        cachedData[key] = JSON.stringify(redisValue);
    }

    private static extractKeyValue(key: string): RedisValue
    {
        let redisValue: RedisValue;
        const err = '(error) WRONGTYPE Operation against a key holding the wrong kind of value';
        try 
        {
            redisValue = JSON.parse(cachedData[key]);
            if (!_.isObject(redisValue) || RESPFormat.array.test(redisValue.data)) 
                throw new Error(err);
        } 
        catch
        {
            throw new Error(err);
        }

        return redisValue;
    }

    private static extractArray(key: string): string[] 
    {
        let redisValue: RedisValue;
        const err = '(error) WRONGTYPE Operation against a key holding the wrong kind of value';
        try 
        {
            redisValue = JSON.parse(cachedData[key]);
            if (!_.isObject(redisValue) || !RESPFormat.array.test(redisValue.data)) 
                throw new Error(err);
        } 
        catch
        {
            throw new Error(err);
        }

        return JSON.parse(Deserializer.array(redisValue.data));
    }

    public static lPush(key: string, ...args: string[]): string 
    {
        if (!key || args.length === 0)
            return "ERR wrong number of arguments for 'lpush' command";

        const arr: string[] = (key in cachedData) ? CommandModule.extractArray(key) : [];
        arr.unshift(...args.reverse());

        CommandModule.insertRedisArray(key, ...arr);

        return `(integer) ${args.length}`;
    }

    public static rPush(key: string, ...args: string[]): string 
    {
        if (!key || args.length === 0)
            return "ERR wrong number of arguments for 'rpush' command";

        const arr: string[] = (key in cachedData) ? CommandModule.extractArray(key) : [];
        arr.push(...args);

        CommandModule.insertRedisArray(key, ...arr);

        return `(integer) ${args.length}`;
    }

    public static lRange(key: string, start: any, stop: any): string 
    {
        if (!(key && start && stop))
            return "ERR wrong number of arguments for 'LRANGE' command";
        if (!(key in cachedData))
            return '(empty array)';
        if (isNaN(start) || isNaN(stop))
            return 'ERR value is not an integer';

        let arr: string[];
        try 
        {
            arr = CommandModule.extractArray(key);
        } 
        catch 
        {
            return '(error) WRONGTYPE Operation against a key holding the wrong kind of value';
        }

        const convertIndex = (index: number) => (index < 0) ? arr.length + index + 1 : index;
        arr = arr.slice(convertIndex(parseInt(start)), convertIndex(parseInt(stop)));
        let str: string = '';
        for (const [index, key] of arr.entries())
            str += `${index + 1}) "${key}"\n`;

        return str.slice(0, -1);
    }

    public static save(): string 
    {
        try 
        {
            saveData();
            return "DB saved";
        } 
        catch 
        {
            return "Failed to save DB";
        }
    }
}

type LowercaseExpiryTimeUnit = "ex" | "px" | "exat" | "pxat";
type UppercaseExpiryTimeUnit = "EX" | "PX" | "EXAT" | "PXAT";
type ExpiryTimeUnit = LowercaseExpiryTimeUnit | UppercaseExpiryTimeUnit;
