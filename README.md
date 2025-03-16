# TypeScript Definition Finder MCP Server

A Model Context Protocol (MCP) server that helps AI code editors find TypeScript symbol definitions in your codebase. This tool is particularly useful when you need to locate the original definition of imported symbols, classes, interfaces, or functions in a TypeScript project.

## Features

- Finds original definitions of TypeScript symbols
- Works with imported symbols from external packages
- Returns both the definition location and code snippet
- Supports stdio interface for seamless integration with AI code editors

## Prerequisites

- [Bun](https://bun.sh) v1.2.2 or later
- Node.js for running the compiled server

## Installation

1. Install dependencies:
```bash
bun install
```

2. Build the project:
```bash
bun run build
```

## Usage

Start the stdio server:
```bash
node dist/run.js
```

### Tool Description

The server provides a `find_typescript_definition` tool with the following capabilities:

- **Tool Name**: `find_typescript_definition`
- **Trigger Command**: `/ts-def`
- **Purpose**: Locates the original definition of TypeScript symbols in your codebase

### Input Parameters

The tool requires three parameters:

1. `file_path` (string): 
   - The absolute path to the current TypeScript file
   - Example: `/path/to/your/project/src/index.ts`

2. `line_number` (number):
   - The 1-based line number where the symbol appears
   - Must be the exact line where the symbol is used

3. `column_number` (number):
   - The 1-based column number where the symbol starts
   - Must be the exact column position of the symbol's first character

### Examples

1. **Finding an Imported Symbol Definition**

Given this import statement:
```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```
If this line is on line 4 and `StdioServerTransport` starts at column 10, you would use:
```json
{
  "file_path": "/path/to/project/src/index.ts",
  "line_number": 4,
  "column_number": 10
}
```
The output of this tool will be:
```json
[
  {
    "file": "/Users/rossz/workspace/ai-tools/mcp/ts-def-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.d.ts",
    "type": "Definition",
    "location": "Line 9, Column 22",
    "codeSnippet": 
"/**
 * Definition of StdioServerTransport class
 */
export declare class StdioServerTransport implements Transport {
    private _stdin;
    private _stdout;
    private _readBuffer;
    private _started;
    constructor(_stdin?: Readable, _stdout?: Writable);
    onclose?: () => void;
    onerror?: (error: Error) => void;
    onmessage?: (message: JSONRPCMessage) => void;
    _ondata: (chunk: Buffer) => void;
    _onerror: (error: Error) => void;
    
    /**
     * Starts listening for messages on stdin.
     */
    start(): Promise<void>;
    private processReadBuffer;
    close(): Promise<void>;
    send(message: JSONRPCMessage): Promise<void>;
}"
  }
]
```

2. **Finding a Local Symbol Definition**

For a local class usage:
```typescript
class MyService {
  private transport: StdioServerTransport;
}
```
If `StdioServerTransport` is on line 15 and starts at column 20, use:
```json
{
  "file_path": "/path/to/project/src/service.ts",
  "line_number": 15,
  "column_number": 20
}
```

### Response Format

The tool returns a JSON response containing:
- The file path where the definition was found
- The line number of the definition
- The actual code snippet of the definition

## Development

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Running in Development Mode

For development, you can run the server directly using Bun:
```bash
bun run index.ts
```

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
