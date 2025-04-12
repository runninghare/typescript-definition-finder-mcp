#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { readFile } from 'fs/promises';
import { findDefinition } from './ts-def.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment variables
dotenv.config();

const tools =  [
    {
        "name": "find_typescript_definition",
        "description": "Use /ts-def to trigger this tool. This tool can find the definition of a TypeScript symbol in your codebase. When you encounter an imported symbol (e.g., 'import { StdioServerTransport } from \"@modelcontextprotocol/sdk/server/stdio.js\"'), this tool will locate its original definition file and code. Simply provide the current file path, the symbol you want to find (e.g., 'StdioServerTransport'), and the line content containing that symbol.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "file_path": {
              "type": "string",
              "description": "The absolute path to the current typescript file (e.g., '/remote/.../src/index.ts')",
            },
            "symbol": {
              "type": "string",
              "description": "The TypeScript symbol (variable, class name, interface, type, etc.) you want to find the definition of. This symbol must be present in the line_content.",
            },
            "line_content": {
              "type": "string",
              "description": "The entire line containing the symbol you want to find the definition of. The line content will be used to find both the line number in the file and the exact position of the symbol.",
            }
          },
          "required": ["file_path", "symbol", "line_content"]
        }
    }
  ];

class RubiiDbServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "typescript-definition-finder-mcp",
        version: "0.1.0"
      },
      {
        capabilities: {
          tools: {},
        }
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      console.log("SIGINT received");
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools
    }));

    // Call tool handler
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        // console.log("======== tool being called =========");
        // console.log(JSON.stringify(request, null, 2));

        // Check if the tool exists
        const tool = tools.find((t: any) => t.name === request.params.name);
        if (!tool) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }

        try {
          // Process the tool request based on the tool name
          if (request.params.name === "find_typescript_definition") {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, "Missing arguments");
            }
            const { file_path, symbol, line_content } = request.params.arguments;
            var results = findDefinition(file_path as string, symbol as string, line_content as string);
          } else {
            // throw error
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify(results, null, 2)
            }]
          };
        } catch (error) {
          console.error("Error executing tool:", error);
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true,
          };
        }
      }
    );
  }

  async runStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Log to stderr to avoid interfering with MCP communication on stdout
    console.error("Rubii DB MCP server running on stdio");
  }

  async runSSE() {
    const app = express();
    const transports = new Map<string, SSEServerTransport>();

    app.get("/sse", async (req, res) => {
      const transport = new SSEServerTransport("/messages", res as Response);
      await this.server.connect(transport);
      // Store the transport instance for later use. For simplicity, we assume a single client here.
      app.locals.transport = transport;
    });
    
    app.post("/messages", async (req, res) => {
      const transport = app.locals.transport;
      await transport.handlePostMessage(req, res);
    });

    app.listen(3012, () => {
      console.log(`Server is running on port 3012`);
    });
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const useSSE = args.includes('--sse');
const useStdio = args.includes('--stdio') || !useSSE; // Default to stdio if neither is specified

// Start the server
const server = new RubiiDbServer();
if (useSSE) {
  console.error("Starting server in SSE mode");
  server.runSSE().catch(console.error);
} else {
  console.error("Starting server in stdio mode");
  server.runStdio().catch(console.error);
}

// Export for testing
export { RubiiDbServer };
