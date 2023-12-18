# Redis Lite Server

## Overview

This project is a fully functional Redis Lite server implemented in TypeScript/Node.js. It replicates the basic functionality of Redis, an in-memory data structure server, supporting key-value operations, serialization/deserialization, concurrency handling, and various Redis commands.

## Features

- **Serialization and Deserialization:** Implements Redis Serialization Protocol (RESP) for effective communication with clients.

- **Redis Lite Server:** A fully functional server that listens for clients on port 6379. Handles various commands using RESP serialization and deserialization.

- **Key-Value Operations:** Supports core Redis functionality with SET and GET commands. Stores and retrieves key-value pairs.

- **Concurrent Client Handling:** Enhanced server to handle multiple concurrent clients. Supports both one thread per client and asynchronous programming.

- **Expiry Options for SET:** Extends SET command to include expiry options like EX, PX, EXAT, and PXAT. Provides automated testing for proper setting and expiration of values.

- **Additional Commands:** Implements additional Redis commands, including EXISTS, PING, ECHO, LISTKEYS, DEL, INCR, DECR, LPUSH, RPUSH, LRANGE, SAVE, and load on startup.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) installed
- A package manager such as [npm](https://www.npmjs.com/) (comes with Node.js installation)
- TypeScript installed:
   ```bash
   npm i -g typescript
   ```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tzvii/redis-lite-server.git
   ```

2. Navigate to the project directory:

   ```bash
   cd redis-lite-server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build project:

   ```bash
   npm run build
   ```

## Usage

1. **Activate the server:**
   ```bash
   npm run redis-lite-server
   ```

2. **Connect to the Server:**
   Connect to the Redis Lite TCP server by your preferred method.
   - One method is to use a network utility like Netcat.
   ```bash
   nc localhost 6379
   ```

3. **Execute Redis Commands:**
   Execute Redis commands like PING, ECHO, SET, GET, EXISTS, DEL, INCR, DECR, LPUSH, RPUSH, SAVE, etc.


## Additional Notes

- **RESP Protocol Specifications:** The implementation adheres to the RESP protocol specifications outlined in the Redis documentation.

- **Redis Commands:** Refer to Redis documentation for detailed information on each supported command during usage.

## Contributors

- Tzvi Mashiach

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.