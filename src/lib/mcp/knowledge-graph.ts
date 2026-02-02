
import {
    GraphNode,
    Edge,
    UserEntity,
    PaymentEntity,
    CycleEntity,
    ObservationEntity
} from './schema';
import { supabase } from '../supabase';

// In a real MCP server, this would persist to a Graph DB (Neo4j) or Relational Tables (pg_graph).
// For this architecture, we simulate the graph operations over Supabase + identifying relationships.

export class KnowledgeGraphManager {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: Edge[] = [];

    constructor() { }

    /**
     * Hydrates the graph with core entities from Supabase for a specific user.
     */
    async hydration(userId: string): Promise<void> {
        // 1. Fetch User Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Error fetching profile:', profileError);
            return;
        }

        const userNode: UserEntity = {
            id: profile.id,
            type: 'user',
            supabase_id: profile.id,
            email: profile.email,
            full_name: profile.full_name || undefined,
            // Default to English if not specified, logic to detect language can be added
            language: 'en',
            created_at: profile.created_at,
            updated_at: new Date().toISOString(),
        };
        this.addNode(userNode);

        // 2. Fetch Payments
        const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId);

        if (paymentError) {
            console.error('Error fetching payments:', paymentError);
        } else if (payments) {
            payments.forEach(p => {
                const paymentNode: PaymentEntity = {
                    id: p.id,
                    type: 'payment',
                    user_id: userId,
                    amount: p.amount,
                    currency: p.currency,
                    status: p.status === 'completed' ? 'success' : p.status === 'pending' ? 'pending' : 'failed',
                    spaceremit_code: p.spaceremit_code || undefined,
                    transaction_date: p.created_at,
                    created_at: p.created_at,
                    updated_at: p.updated_at,
                };
                this.addNode(paymentNode);
                this.addEdge({
                    source_id: userId,
                    target_id: paymentNode.id,
                    type: 'MADE_PAYMENT',
                    weight: 1.0,
                });
            });
        }

        // 3. (Future) Fetch Cycles and Health Markers from their respective tables
        // const { data: cycles } = await supabase.from('cycles').select('*').eq('user_id', userId);
        // ... logic to add cycle nodes
    }

    addNode(node: GraphNode) {
        this.nodes.set(node.id, node);
    }

    addEdge(edge: Edge) {
        this.edges.push(edge);
    }

    /**
     * MCP Context Retrieval: Finds relevant nodes based on a query and graph traversal.
     * If the user asks about "Post-Cycle", we look for the most recent 'cycle' node 
     * connected to the user, particularly those with status 'completed' or 'active'.
     */
    async getContext(userId: string, query: string): Promise<GraphNode[]> {
        const contextNodes: GraphNode[] = [];
        const userNode = this.nodes.get(userId);
        if (!userNode) return [];

        // Simple keyword matching for demonstration, but aiming for semantic later
        const lowerQuery = query.toLowerCase();

        // 1. Direct Neighborhood Search
        // Get all edges from User
        const userEdges = this.edges.filter(e => e.source_id === userId);

        for (const edge of userEdges) {
            const targetNode = this.nodes.get(edge.target_id);
            if (!targetNode) continue;

            // Relation-based retrieval
            if (lowerQuery.includes('payment') || lowerQuery.includes('subscription')) {
                if (targetNode.type === 'payment') {
                    contextNodes.push(targetNode);
                }
            }

            if (lowerQuery.includes('cycle') || lowerQuery.includes('steroid') || lowerQuery.includes('pct')) {
                if (targetNode.type === 'cycle') {
                    contextNodes.push(targetNode);
                    // Expand to steroid nodes connected to this cycle
                    const cycleEdges = this.edges.filter(e => e.source_id === targetNode.id);
                    for (const cycleEdge of cycleEdges) {
                        const steroidNode = this.nodes.get(cycleEdge.target_id);
                        if (steroidNode && steroidNode.type === 'steroid') {
                            contextNodes.push(steroidNode);
                        }
                    }
                }
            }
        }

        // 2. Observations (Memory logs)
        // If the user asks about "feeling", retrieve recent observations
        if (lowerQuery.includes('feel') || lowerQuery.includes('mood') || lowerQuery.includes('pain')) {
            // Logic to fetch observation nodes
            const observations = Array.from(this.nodes.values())
                .filter(n => n.type === 'observation' && (n as ObservationEntity).user_id === userId);
            contextNodes.push(...observations);
        }

        return contextNodes;
    }

    /**
     * Logs a new observation into the graph.
     * Handles conflict resolution if the new observation contradicts an old one (e.g., status update).
     */
    logObservation(observation: ObservationEntity) {
        // Conflict Resolution:
        // If this observation is about a cycle status change, ensuring consistency.
        if (observation.related_entity_id) {
            const relatedNode = this.nodes.get(observation.related_entity_id);
            if (relatedNode && relatedNode.type === 'cycle') {
                // Example: User says "I stopped the cycle"
                if (observation.content.toLowerCase().includes('stopped') || observation.content.toLowerCase().includes('quit')) {
                    (relatedNode as CycleEntity).status = 'abandoned';
                    relatedNode.updated_at = new Date().toISOString();
                    // Persist update to DB would happen here
                }
            }
        }

        this.addNode(observation);
        this.addEdge({
            source_id: observation.user_id,
            target_id: observation.id,
            type: 'RELATED_TO', // Or generic 'HAS_OBSERVATION'
            weight: 0.5
        });
    }

    /**
     * Generates a "Technical Map" of the current graph state for debugging/admin.
     */
    generateGraphMap(): object {
        return {
            nodeCount: this.nodes.size,
            edgeCount: this.edges.length,
            nodes: Array.from(this.nodes.values()),
            edges: this.edges
        };
    }
}
