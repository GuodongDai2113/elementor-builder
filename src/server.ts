import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ALL_TOOLS } from "./tools.js";
import { PageManager } from "./page.js";

export interface ServerOptions {
  rootDir?: string;
}

export async function createAndStartServer(options: ServerOptions = {}): Promise<void> {
  const pm = new PageManager({ rootDir: options.rootDir });

  const server = new McpServer({
    name: "elementor-builder-mcp",
    version: "1.0.0"
  });

  const outputSchema = { result: z.unknown() };

  for (const tool of ALL_TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema
      },
      async (input: Record<string, unknown>) => {
        try {
          const data = await tool.handler(input, pm);
          return {
            content: [{ type: "text" as const, text: `${JSON.stringify(data, null, 2)}\n` }]
          };
        } catch (error) {
          return {
            content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}\n` }],
            isError: true
          };
        }
      }
    );
  }

  await server.connect(new StdioServerTransport());
}
