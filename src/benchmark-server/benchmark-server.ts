import * as net from 'net';
import { Deserializer } from '../data-conversion/Deserializer';
import { dispatchCommand, processData } from '../commands/commandDispatcher';
import { Serializer } from '../data-conversion/Serializer';

const server: net.Server = net.createServer((socket: net.Socket) => 
{
    socket.setEncoding('utf8');

    socket.on('data', (data: string) => 
    {
        if (!data.includes('CONFIG'))
            socket.write(_processCommand(data));
        else 
        {
            const commands: string[] = data
                .split(/\*(?=\d+)/)
                .filter((command) => command.trim() !== '')
                .map(e => '*' + e);

            for (const command of commands)
                socket.write(_processCommand(command));
        }
    });

    socket.on('end', () => {});
    socket.on('close', () => {});
    socket.on('error', () => {});
});

const PORT: number = 6379;
server.listen(PORT, () => 
{
    console.log(`Server listening on port ${PORT}`);
});

function _processCommand(respArr: string): string
{
    const arr: string[] = JSON.parse(Deserializer.array(respArr));
    const command: string = arr.shift();
    const response: string = dispatchCommand(command, ...arr);
    return command === 'GET' ? response : Serializer.simpleString(response);
}