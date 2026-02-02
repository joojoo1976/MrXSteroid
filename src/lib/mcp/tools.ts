
import { z } from 'zod';
import { calculateMacros, calculateBodyFat, calculateGeneticPotential } from '../../utils/calculators';
import { MachineMemoryServer, defaultServerConfig } from './server';

// Initialize MCP Server for tool usage
const memoryServer = new MachineMemoryServer(defaultServerConfig);

/**
 * 🛠️ TOOL DEFINITIONS & SCHEMAS
 * "Mr. X Elite Standards" - Zero Hallucination, Strict Typing.
 */

// 1. MACRO CALCULATOR
const CalculateMacrosSchema = z.object({
    weightKg: z.number().min(30).max(300).describe("User's weight in Kilograms (KG). If user provides LBS, convert to KG first."),
    heightCm: z.number().min(100).max(250).describe("User's height in Centimeters (CM)."),
    age: z.number().min(15).max(100).describe("User's age in years."),
    gender: z.enum(['male', 'female']).describe("Biological sex for BMR calculation."),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'veryActive'])
        .describe("Lifestyle activity level. 'moderate' is standard for 3-4 gym days/week."),
    goal: z.enum(['cut', 'maintain', 'bulk'])
        .describe("User's primary goal. 'cut' for fat loss, 'bulk' for muscle gain.")
});

export const macroCalculatorTool = {
    name: 'calculate_macros',
    description: `
    CRITICAL: Use this tool ONLY when the user asks for a diet plan, macros, or calorie targets.
    
    OUTPUT: Returns daily calories, protein (g), carbs (g), fats (g), and growth potential.
    
    CONSTRAINTS:
    - Input weight MUST be in KG.
    - Input height MUST be in CM.
    - If input is missing, ASK the user before calling. Do not guess.
    
    EXAMPLE:
    User: "I'm 80kg, 180cm, 25 years old, male, lifting 4x a week, want to bulk."
    Call: calculate_macros({ weightKg: 80, heightCm: 180, age: 25, gender: 'male', activityLevel: 'active', goal: 'bulk' })
  `,
    schema: CalculateMacrosSchema,
    execute: async (args: z.infer<typeof CalculateMacrosSchema>) => {
        try {
            return calculateMacros(args);
        } catch (e) {
            return { error: "Failed to calculate macros. Verify inputs are valid numbers." };
        }
    }
};

// 2. BODY FAT CALCULATOR
const CalculateBodyFatSchema = z.object({
    gender: z.enum(['male', 'female']),
    waistCm: z.number().min(50).max(200).describe("Waist circumference at navel level (CM)."),
    neckCm: z.number().min(20).max(60).describe("Neck circumference (CM)."),
    heightCm: z.number().min(100).max(250).describe("Height (CM)."),
    hipCm: z.number().optional().describe("Hip circumference (CM). REQUIRED if gender is female."),
    weightKg: z.number().describe("Weight in KG used to calculate fat mass.")
});

export const bodyFatCalculatorTool = {
    name: 'calculate_body_fat',
    description: `
    Calculates Body Fat Percentage using the US Navy Method.
    
    REQUIREMENTS:
    - For Males: Waist, Neck, Height.
    - For Females: Waist, Neck, Height, Hips.
    
    OUTPUT: Body Fat %, Lean Mass (kg), Fat Mass (kg), and Category (e.g., 'Athletes').
  `,
    schema: CalculateBodyFatSchema,
    execute: async (args: z.infer<typeof CalculateBodyFatSchema>) => {
        try {
            if (args.gender === 'female' && !args.hipCm) {
                return { error: "Hip measurement is required for females.", field: "hipCm" };
            }
            return calculateBodyFat(args, args.weightKg);
        } catch (e: any) {
            return { error: e.message || "Calculation failed" };
        }
    }
};

// 3. GENETIC POTENTIAL CALCULATOR
const CalculateGeneticPotentialSchema = z.object({
    heightCm: z.number(),
    wristCm: z.number(),
    ankleCm: z.number(),
    bodyFatPercentage: z.number().default(12)
});

export const geneticPotentialTool = {
    name: 'calculate_genetic_potential',
    description: `
    Estimates the user's maximum natural muscular potential (Casey Butt's / FFMI model).
    Useful when user asks "how big can I get naturally?".
  `,
    schema: CalculateGeneticPotentialSchema,
    execute: async (args: z.infer<typeof CalculateGeneticPotentialSchema>) => {
        return calculateGeneticPotential(args);
    }
};

// 4. SEARCH KNOWLEDGE GRAPH (MEMORY)
const SearchGraphSchema = z.object({
    userId: z.string().uuid().describe("The authenticated user's ID."),
    query: z.string().describe("The semantic search query (e.g., 'My last cycle', 'payment history')."),
});

export const searchMemoryTool = {
    name: 'search_knowledge_graph',
    description: `
    Retrieves context from the Mr. X Knowledge Graph.
    Use this to recall:
    - User's previous cycles (steroids used, dates).
    - Recorded health markers (bloodwork).
    - Payment/Subscription status.
    - Past observations or logs.
    
    DO NOT use for general knowledge (like 'what is Trenbolone?'). Use this ONLY for USER-SPECIFIC data.
  `,
    schema: SearchGraphSchema,
    execute: async (args: z.infer<typeof SearchGraphSchema>) => {
        try {
            await memoryServer.initializeSession(args.userId);
            const nodes = await memoryServer.search(args.userId, args.query);
            if (nodes.length === 0) return "No relevant records found in memory.";
            return nodes;
        } catch (e) {
            return { error: "Failed to search memory system." };
        }
    }
};

// 5. LOG OBSERVATION (MEMORY)
const LogObservationSchema = z.object({
    userId: z.string().uuid(),
    content: z.string().describe("The observation to log. e.g., 'User reported high blood pressure', 'User started cutting cycle'."),
    type: z.enum(['observation', 'decision']).default('observation')
});

export const logObservationTool = {
    name: 'log_observation',
    description: `
    Saves a new fact or event to the user's permanent memory graph.
    Call this when the user:
    - Updates their current status (e.g., "I started my cycle").
    - Reports a side effect.
    - Sets a new goal.
  `,
    schema: LogObservationSchema,
    execute: async (args: z.infer<typeof LogObservationSchema>) => {
        await memoryServer.initializeSession(args.userId);
        await memoryServer.write(args.userId, args.content, args.type);
        return { success: true, message: "Observation recorded in Knowledge Graph." };
    }
};

/**
 * 📢 TOOL MANIFEST
 * Exporting all tools for the Agent Executor.
 */
export const eliteTools = [
    macroCalculatorTool,
    bodyFatCalculatorTool,
    geneticPotentialTool,
    searchMemoryTool,
    logObservationTool
];

export type EliteToolName =
    | 'calculate_macros'
    | 'calculate_body_fat'
    | 'calculate_genetic_potential'
    | 'search_knowledge_graph'
    | 'log_observation';
