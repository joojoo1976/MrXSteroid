
import { KnowledgeGraphManager } from './knowledge-graph';
import { GraphNode } from './schema';
import { loggers } from '../../utils/logger';

export interface MCPServerConfig {
    projectId: string;
    enableArabicSupport: boolean;
    persistenceMode: 'supabase' | 'memory';
}

export class MachineMemoryServer {
    private graphManager: KnowledgeGraphManager;
    private config: MCPServerConfig;

    constructor(config: MCPServerConfig) {
        this.config = config;
        this.graphManager = new KnowledgeGraphManager();
    }

    /**
     * Initializes the server session for a specific user.
     * Loads the user's graph into memory from Supabase.
     */
    async initializeSession(userId: string) {
        loggers.mcp.debug(`Initializing session for user: ${userId}`);
        await this.graphManager.hydration(userId);
        loggers.mcp.debug('Graph hydrated', this.graphManager.generateGraphMap());
    }

    /**
     * Semantic Search: Finds relevant memory nodes based on user query.
     */
    async search(userId: string, query: string): Promise<GraphNode[]> {
        loggers.mcp.debug(`Searching memory for query: "${query}"`);
        return await this.graphManager.getContext(userId, query);
    }

    /**
     * Write Memory: Logs a new observation or updates an entity.
     */
    async write(userId: string, content: string, type: 'observation' | 'decision' = 'observation') {
        if (type === 'observation') {
            const observation = {
                id: crypto.randomUUID(),
                type: 'observation' as const,
                user_id: userId,
                content: content,
                sentiment: 'neutral' as const, // Placeholder logic
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            this.graphManager.logObservation(observation);
            loggers.mcp.debug(`Wrote observation: "${content}"`);
        }
    }

    /**
     * Diagnostics: Returns the full graph state.
     */
    getDiagnostics() {
        return this.graphManager.generateGraphMap();
    }
}

export const defaultServerConfig: MCPServerConfig = {
    projectId: 'mr-x-steroid',
    enableArabicSupport: true,
    persistenceMode: 'supabase',
};
