# TypeScript Definition Finder MCP Server

A Model Context Protocol (MCP) server that helps AI code editors find TypeScript symbol definitions in your codebase. This tool is particularly useful when you need to locate the original definition of imported symbols, classes, interfaces, or functions in a TypeScript project.

## Features

- Finds original definitions of TypeScript symbols
- Works with imported symbols from external packages
- Returns both the definition location and code snippet
- Supports stdio interface for seamless integration with AI code editors

## Prerequisites

- TypeScript project with `typescript` dependency installed
- Node.js for running the server

## Installation & Usage

This is a Model Context Protocol (MCP) stdio server that requires access to your local filesystem to find TypeScript definitions. To use it:

1. Ensure your project has TypeScript installed as a dependency
2. Run the following command in your project directory:
```bash
npx -y ts-def-mcp@latest
```

You can integrate this command with various AI code editors that support MCP:
- Claude Desktop
- Cursor
- Windsurf
- Roo Cline Editor

> **Important Note**: Due to the local filesystem access requirements, Docker + WebSocket solutions will not work. Please ignore the installation guide on https://smithery.ai/server/@runninghare/typescript-definition-finder-mcp.

### Tool Description

The server provides a `find_typescript_definition` tool with the following capabilities:

- **Tool Name**: `find_typescript_definition`
- **Trigger Command**: `/ts-def` (Useful in `Cursor` if you want to force AI editor to find the referenced symbol definition)
- **Purpose**: Locates the original definition of TypeScript symbols in your codebase

### Input Parameters

The tool requires three parameters:

1. `file_path` (string): 
   - The absolute path to the current TypeScript file
   - Example: `/path/to/your/project/src/index.ts`

2. `line_content` (string):
   - The entire line containing the symbol you want to find the definition of
   - Used to locate the correct line in the file
   - Must match the line exactly as it appears in the file

3. `column_number` (number):
   - The 1-based column number where the symbol starts
   - Must be the exact column position of the symbol's first character

### Examples

1. **Finding an Imported Symbol Definition**

Given this import statement:
```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```
To find the definition of `StdioServerTransport`, which starts at column 10, you would use:
```json
{
  "file_path": "~/my-mcp-project/src/index.ts",
  "line_content": "import { StdioServerTransport } from \"@modelcontextprotocol/sdk/server/stdio.js\";",
  "column_number": 10
}
```
The output of this tool will be:
```json
[
  {
    "file": "~/my-mcp-project/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.d.ts",
    "type": "Definition",
    "location": "Line 9, Column 22",
    "codeSnippet": "   8    */\n   9 > export declare class StdioServerTransport implements Transport {\n  10 +     private _stdin;\n  11 +     private _stdout;\n  12 +     private _readBuffer;\n  13 +     private _started;\n  14 +     constructor(_stdin?: Readable, _stdout?: Writable);\n  15 +     onclose?: () => void;\n  16 +     onerror?: (error: Error) => void;\n  17 +     onmessage?: (message: JSONRPCMessage) => void;\n  18 +     _ondata: (chunk: Buffer) => void;\n  19 +     _onerror: (error: Error) => void;\n  20 +     /**\n  21 +      * Starts listening for messages on stdin.\n  22 +      */\n  23 +     start(): Promise<void>;\n  24 +     private processReadBuffer;\n  25 +     close(): Promise<void>;\n  26 +     send(message: JSONRPCMessage): Promise<void>;\n  27   }\n"
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
To find the definition of `StdioServerTransport`, which starts at column 20, use:
```json
{
  "file_path": "/path/to/project/src/service.ts",
  "line_content": "  private transport: StdioServerTransport;",
  "column_number": 20
}
```

### Response Format

The tool returns a JSON response containing:
- The file path where the definition was found
- The line number of the definition
- The actual code snippet of the definition

### Cursor Calling Example

<img width="1586" alt="2025-04-04_06-35-36" src="https://github.com/user-attachments/assets/5134d47e-7259-410c-9beb-7bb443b393bf" />

## Development

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Running in Development Mode

For development, you can run the server directly using Bun:
```bash
bun run src/index.ts
```

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
