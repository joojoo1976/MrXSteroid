
import { MachineMemoryServer, defaultServerConfig } from './server';

// Singleton instance for the application
const mcpServer = new MachineMemoryServer(defaultServerConfig);

/**
 * Hook to initialize MCP for the current user session.
 * Call this after successful login.
 */
export async function initializeMCP(userId: string) {
    try {
        await mcpServer.initializeSession(userId);
    } catch (err) {
        console.error('Failed to initialize MCP:', err);
    }
}

/**
 * Log a payment success event to the Knowledge Graph.
 */
export async function logPaymentSuccess(userId: string, transactionId: string, amount: number, currency: string) {
    try {
        const memoryContent = `User made a successful payment of ${amount} ${currency}. Transaction ID: ${transactionId}`;
        await mcpServer.write(userId, memoryContent, 'observation');

        // Also, create an edge link explicitly
        // mcpServer.addEdge({ source: userId, target: paymentId, type: 'MADE_PAYMENT' });
    } catch (err) {
        console.error('Failed to log payment to MCP:', err);
    }
}

/**
 * Log a new weight entry or health marker.
 */
export async function logHealthMarker(userId: string, markerName: string, value: number, unit: string) {
    try {
        const memoryContent = `User recorded ${markerName}: ${value} ${unit}`;
        await mcpServer.write(userId, memoryContent, 'observation');
    } catch (err) {
        console.error('Failed to log marker to MCP:', err);
    }
}
