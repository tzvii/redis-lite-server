import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { RedisValue } from '../types/RedisValue';
import { JSONTools } from '../common/JSONTools';

export const cachedData: {[key: string]: any} = {};
const BIN_FILE = 'redis-data.bin';

export function loadData(): void
{
    try
    {
        const binDirectory: string = path.join(__dirname, '../..', 'bin');
        if (!fs.existsSync(binDirectory)) 
            fs.mkdirSync(binDirectory, { recursive: true });

        const binPath: string = path.join(binDirectory, BIN_FILE);
        if (!fs.existsSync(binPath))
        {
            const dataToSave: Buffer = Buffer.from(JSON.stringify({}), 'utf8');
            fs.writeFileSync(binPath, dataToSave);
        }

        const rawData: string = fs.readFileSync(binPath, 'utf8');
        const parsedData: {} = JSON.parse(rawData.toString());
        Object.assign(cachedData, parsedData);
    }
    catch (e)
    {
        console.error(`Error loading Redis data: ${e}`);
    }
}

export function saveData(): void
{
    try
    {
        const dataToSave: Buffer = Buffer.from(JSON.stringify(cachedData), 'utf8');
        const binPath: string = path.join(__dirname, '../..', 'bin', BIN_FILE);
        fs.writeFileSync(binPath, dataToSave);
    }
    catch (e)
    {
        console.error(`Error saving Redis data: ${e}`);
    }
}

export function checkTTL(): void
{
    const numRandomKeys = 10;

    try
    {
        const keys: string[] = getRandomKeys(numRandomKeys);
        const currTime: number = Date.now();
        for (const key of keys)
        {
            const val: RedisValue = JSONTools.parse(cachedData[key]);
            if (val?.ttl && val.ttl <= currTime)
                delete cachedData[key];
        }
    }
    catch (e)
    {
        console.error(e);
    }
}

function getRandomKeys(numKeys: number): string[]
{
    // TODO: O(n) -- not good. Find a way to do this in constant or logarithmic time.
    return _.sampleSize(Object.keys(cachedData), numKeys);
}