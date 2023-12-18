import * as net from 'net';
import { processData } from '../commands/commandDispatcher';
import { checkTTL, loadData, saveData } from '../db/redis-lite-db';
import { format } from 'date-fns';

const socketConns: Set<net.Socket> = new Set();

// Event-driven and Async
const server: net.Server = net.createServer((socket: net.Socket) => 
{
    socketConns.add(socket);
    
    const addr = <net.AddressInfo>socket.address();
    const prompt: string = `redis-lite:${addr.port}> `;

    // Display a welcome message
    socket.write(`Welcome to Redis-Lite\nType your commands below:\n${prompt}`);

    // Set encoding to utf8 to handle string data
    socket.setEncoding('utf8');

    // Event listener for receiving data from the client
    socket.on('data', (data: string) => 
    {
        const response = processData(data);

        // Send the response back to the client with a new line
        socket.write(response + `\n${prompt}`);
    });

    // Handle client disconnection
    socket.on('end', () => {});

    // Handle socket closure
    socket.on('close', () => socketConns.delete(socket));

    // Handle errors
    socket.on('error', (err) => console.error(`Socket error: ${err.message}`));
});

const PORT: number = 6379;
server.listen(PORT, () => 
{
    const { port, address, family } = <net.AddressInfo>server.address();
    const getDate = () => format(new Date(), 'dd MMM yyyy HH:mm:ss.SSS');
    const serverLog = (str: string) => console.log(`${port}:${address}:${family}`, getDate(), str);

    // Loads saved data into internal memory
    serverLog('* Preparing to load DB from disk');
    loadData();
    serverLog('* DB loaded successfully');

    serverLog('* Server initialized')
    serverLog(`* Server listening on port ${PORT}`);
    serverLog('* Ready to accept connections');

    // Auto-deletes expired data every second
    const autoDeleteId: NodeJS.Timeout = setInterval(checkTTL, 1_000);

    // Auto-saves data every 30 seconds
    const autoSaveId: NodeJS.Timeout = setInterval(saveData, (30 * 1_000));

    server.on('close', () => cleanup([autoDeleteId, autoSaveId], serverLog));

    process.stdin.setRawMode(true);
    process.stdin.on('data', (data) =>
    {
        const key = data.toString();
        if (key === '\u0003')  // SIGINT
        {
            console.log("=> Received SIGINT, scheduling shutdown...");
            socketConns.forEach(socket => socket.destroy());
            server.close(() => process.exit(0));
        }
    });
});

function cleanup(intervalIds: NodeJS.Timeout[], serverLog: Function): void
{
    // Stopping execution of recurring processes
    for (const intervalId of intervalIds)
        clearInterval(intervalId);
    
    // Saves all current data into data file
    serverLog('* Saving the final DB snapshot before exiting');
    saveData();
    serverLog('* DB saved to disk');

    serverLog(`* Redis lite server closed, bye bye...`);
};