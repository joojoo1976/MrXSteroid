
import { eliteTools, EliteToolName } from '../lib/mcp/tools';


/**
 * Maps Zod schemas to JSON Schema format compatible with OpenAI and Gemini.
 * Since we want "Elite" stability, we manually define the schema mappings here
 * to avoid runtime introspection issues, while using the actual Zod schema for validation during execution.
 */

// Common definitions for tool parameters
interface PropertyDefinition {
    type: string;
    description?: string;
    enum?: string[];
}

interface ToolDefinition {
    type: string;
    properties: Record<string, PropertyDefinition>;
    required?: string[];
}

const toolDefinitions: Record<EliteToolName, ToolDefinition> = {
    calculate_macros: {
        type: "object",
        properties: {
            weightKg: { type: "number", description: "Weight in KG" },
            heightCm: { type: "number", description: "Height in CM" },
            age: { type: "number", description: "Age in years" },
            gender: { type: "string", enum: ["male", "female"] },
            activityLevel: { type: "string", enum: ["sedentary", "light", "moderate", "active", "veryActive"] },
            goal: { type: "string", enum: ["cut", "maintain", "bulk"] }
        },
        required: ["weightKg", "heightCm", "age", "gender", "activityLevel", "goal"]
    },
    calculate_body_fat: {
        type: "object",
        properties: {
            gender: { type: "string", enum: ["male", "female"] },
            waistCm: { type: "number", description: "Waist circumference in CM" },
            neckCm: { type: "number", description: "Neck circumference in CM" },
            heightCm: { type: "number", description: "Height in CM" },
            hipCm: { type: "number", description: "Hip circumference in CM (Required for females)" },
            weightKg: { type: "number", description: "Weight in KG" }
        },
        required: ["gender", "waistCm", "neckCm", "heightCm", "weightKg"]
    },
    calculate_genetic_potential: {
        type: "object",
        properties: {
            heightCm: { type: "number" },
            wristCm: { type: "number" },
            ankleCm: { type: "number" },
            bodyFatPercentage: { type: "number", description: "Current body fat percentage (default 12)" }
        },
        required: ["heightCm", "wristCm", "ankleCm"]
    },
    search_knowledge_graph: {
        type: "object",
        properties: {
            userId: { type: "string", description: "UUID of the user" },
            query: { type: "string", description: "Search query for memory retrieval" }
        },
        required: ["userId", "query"]
    },
    log_observation: {
        type: "object",
        properties: {
            userId: { type: "string", description: "UUID of the user" },
            content: { type: "string", description: "Observation text" },
            type: { type: "string", enum: ["observation", "decision"] }
        },
        required: ["userId", "content"]
    }
};

export const getOpenAITools = () => {
    return eliteTools.map(tool => ({
        type: "function" as const,
        function: {
            name: tool.name,
            description: tool.description,
            parameters: toolDefinitions[tool.name as EliteToolName]
        }
    }));
};

export const getGeminiTools = () => {
    return {
        functionDeclarations: eliteTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: {
                type: "OBJECT" as const, // Using const assertion to avoid strict SchemaType enum dependency
                properties: toolDefinitions[tool.name as EliteToolName].properties,
                required: toolDefinitions[tool.name as EliteToolName].required
            }
        }))
    };
};

interface ToolArguments {
    [key: string]: unknown;
}

export const executeToolCall = async (toolName: string, args: ToolArguments) => {
    const tool = eliteTools.find(t => t.name === toolName);
    if (!tool) {
        return { error: `Tool ${toolName} not found.` };
    }

    try {
        // Zod validation (Strict Typing layer)
        const validatedArgs = tool.schema.parse(args);
        return await tool.execute(validatedArgs);
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        const errorDetails = e instanceof Error && 'errors' ? (e as { errors?: unknown }).errors : undefined;
        return { error: `Validation Error: ${errorMessage}`, details: errorDetails };
    }
};
