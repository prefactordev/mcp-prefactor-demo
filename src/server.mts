import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function createMcpServer() {
  // Create an MCP server
  const server = new McpServer({
    name: "mcp-prefactor-demo",
    version: "1.0.0"
  });

  // Add an addition tool
  server.registerTool("add",
    {
      title: "Addition Tool",
      description: "Add two numbers",
      inputSchema: {
        a: z.number({ description: "The first number to add" }),
        b: z.number({ description: "The second number to add" })
      }
    },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(a + b) }]
    })
  )

  return server;
}
