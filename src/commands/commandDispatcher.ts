import CommandModule from "./commandModule";

type CommandHandler = (...args: any[]) => void;

const commandHandlers: Record<string, CommandHandler> =
{
    "PING": CommandModule.ping,
    "ECHO": CommandModule.echo,
    "EXISTS": CommandModule.exists,
    "SET": CommandModule.set,
    "GET": CommandModule.get,
    "DEL": CommandModule.del,
    "LISTKEYS": CommandModule.listKeys,
    "INCR": CommandModule.incr,
    "DECR": CommandModule.decr,
    "LPUSH": CommandModule.lPush,
    "RPUSH": CommandModule.rPush,
    "LRANGE": CommandModule.lRange,
    "SAVE": CommandModule.save,
};

export function processData(data: string): any
{
    const commandArray: string[] = data.trim().split(/\s+/);
    const command: string = commandArray.shift().toUpperCase();
    
    return dispatchCommand(command, ...commandArray);
}

export function dispatchCommand(command: string, ...args: any[]): any
{
    try
    {
        const handler = commandHandlers[command];
        if (!handler)
            return "ERR invalid command";
        
        return handler(...args);
    }
    catch (err)
    {
        return err.message;
    }
}
