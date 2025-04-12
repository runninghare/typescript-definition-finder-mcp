# TypeScript Definition Finder MCP Server

[![smithery badge](https://smithery.ai/badge/@runninghare/typescript-definition-finder-mcp)](https://smithery.ai/server/@runninghare/typescript-definition-finder-mcp)

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

This is a Model Context Protocol (MCP) stdio server that requires access to your local filesystem to find TypeScript definitions.

### Installing via Smithery

To install TypeScript Definition Finder MCP for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@runninghare/typescript-definition-finder-mcp):

```bash
npx -y @smithery/cli install @runninghare/typescript-definition-finder-mcp --client claude
```

### Running the MCP Server
To use the MCP server:

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
- **Trigger Command**: `/ts-def` (Useful in ‘Cursor’ if you want to force AI editor to find the referenced symbol definition)
- **Purpose**: Locates the original definition of TypeScript symbols in your codebase

### Input Parameters

The tool requires three parameters:

1. `file_path` (string): 
   - The absolute path to the current TypeScript file
   - Example: `/path/to/your/project/src/index.ts`

2. `symbol` (string):
   - The TypeScript symbol (variable, class name, interface, type, etc.) you want to find the definition of
   - Must be present in the line_content
   - Example: `StdioServerTransport`, `MyClass`, `interface1`

3. `line_content` (string):
   - The entire line containing the symbol you want to find the definition of
   - Used to locate both the line number in the file and the exact position of the symbol
   - Must contain the symbol exactly as specified

### Examples

1. **Finding an Imported Symbol Definition**

Given this import statement:
```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```
To find the definition of `StdioServerTransport`, you would use:
```json
{
  "file_path": "~/my-mcp-project/src/index.ts",
  "symbol": "StdioServerTransport",
  "line_content": "import { StdioServerTransport } from \"@modelcontextprotocol/sdk/server/stdio.js\";"
}
```

2. **Finding a Local Symbol Definition**

For a local class usage:
```typescript
class MyService {
  private transport: StdioServerTransport;
}
```
To find the definition of `StdioServerTransport`, use:
```json
{
  "file_path": "/path/to/project/src/service.ts",
  "symbol": "StdioServerTransport",
  "line_content": "  private transport: StdioServerTransport;"
}
```

### Response Format

The tool returns a JSON response containing:
- The file path where the definition was found
- The line number of the definition
- The actual code snippet of the definition

### Cursor Calling Example

MCP Input:
```json
{
  "file_path": "/Users/rossz/workspace/ai-tools/mcp/ts-def-mcp/src/index.ts",
  "symbol": "SSEServerTransport",
  "line_content": "import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';"
}
```

MCP Output:
```json
[
  {
    "file": "/Users/rossz/workspace/ai-tools/mcp/ts-def-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/server/sse.d.ts",
    "type": "Definition",
    "location": "Line 9, Column 22",
    "codeSnippet": "   8    */\n   9 > export declare class SSEServerTransport implements Transport {\n  10 +     private _endpoint;\n  11 +     private res;\n  12 +     private _sseResponse?;\n  13 +     private _sessionId;\n  14 +     onclose?: () => void;\n  15 +     onerror?: (error: Error) => void;\n  16 +     onmessage?: (message: JSONRPCMessage) => void;\n  17 +     /**\n  18 +      * Creates a new SSE server transport, which will direct the client to POST messages to the relative or absolute URL identified by `_endpoint`.\n  19 +      */\n  20 +     constructor(_endpoint: string, res: ServerResponse);\n  21 +     /**\n  22 +      * Handles the initial SSE connection request.\n  23 +      *\n  24 +      * This should be called when a GET request is made to establish the SSE stream.\n  25 +      */\n  26 +     start(): Promise<void>;\n  27 +     /**\n  28 +      * Handles incoming POST messages.\n  29 +      *\n  30 +      * This should be called when a POST request is made to send a message to the server.\n  31 +      */\n  32 +     handlePostMessage(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void>;\n  33 +     /**\n  34 +      * Handle a client message, regardless of how it arrived. This can be used to inform the server of messages that arrive via a means different than HTTP POST.\n  35 +      */\n  36 +     handleMessage(message: unknown): Promise<void>;\n  37 +     close(): Promise<void>;\n  38 +     send(message: JSONRPCMessage): Promise<void>;\n  39 +     /**\n  40 +      * Returns the session ID for this transport.\n  41 +      *\n  42 +      * This can be used to route incoming POST requests.\n  43 +      */\n  44 +     get sessionId(): string;\n  45   }\n"
  }
]
```

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