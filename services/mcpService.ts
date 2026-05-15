import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

class MCPService {
    private client: Client | null = null;
    private transport: SSEClientTransport | null = null;

    async connect(url: string): Promise<Client> {
        if (this.client) {
            await this.disconnect();
        }

        try {
            this.transport = new SSEClientTransport(new URL(url));
            
            this.client = new Client(
                {
                    name: "ais-client",
                    version: "1.0.0",
                },
                {
                    capabilities: {},
                }
            );

            await this.client.connect(this.transport);
            return this.client;
        } catch (error) {
            console.error("Failed to connect to MCP server:", error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
        this.transport = null;
    }

    getClient(): Client | null {
        return this.client;
    }
}

export const mcpService = new MCPService();
