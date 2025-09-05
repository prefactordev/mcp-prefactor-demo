import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function unixToDate(unixTimestamp: number) {
  return new Date(unixTimestamp * 1000).toISOString();
}

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
    async ({ a, b }) => {
      return {
        content: [{ type: "text", text: String(a + b) }]
      }
    }
  )

  server.registerTool("whoami",
    {
      title: "Who am I?",
      description: "Get the authenticated user's information",
    },
    // For some reason, if you don't define parameters, the authInfo comes through in the first position, despite
    // what the type says
    async ({ authInfo }) => {
      return {
        content: [
          {
            type: "text",
            text: [
              `Resource = ${authInfo?.resource}`,
              `Authenticated ID = ${authInfo?.extra?.sub}`,
              `Token expires at = ${authInfo?.expiresAt ? unixToDate(authInfo.expiresAt) : "N/A"}`,
              `Client ID = ${authInfo?.clientId}`,
              `Scopes = ${(authInfo?.scopes || []).join(", ")}`
            ].join("\n")
          }
        ]
      }
    }
  )

  return server;
}
