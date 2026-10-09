import { TOOL_REGISTRY, ToolDefinition } from '@/lib/tools/registry';

export interface AIToolDefinition extends ToolDefinition {
  id: number;  // Sequential ID for navigation
  category: string;  // Category name for grouping
  aiTags: string[];
  aiDescription: string;
  relatedTools: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  usageCount?: number;
  userRating?: number;
}

export const aiToolsRegistry = TOOL_REGISTRY.map((tool, index) => ({
  ...tool,
  id: index + 1,
  category: tool.slug.split('-')[0],
  aiTags: generateAITags(tool),
  aiDescription: 'Advanced ' + tool.titleEn + ' for precise ' + tool.slug.replace('-', ' ') + ' calculations. ' + tool.titleEn,
  relatedTools: findRelatedTools(tool),
  difficultyLevel: assessDifficulty(tool),
  estimatedTime: estimateTime(tool),
}));

function generateAITags(tool: any): string[] {
  const keywords = ['nutrition', 'macro', 'calorie', 'protein', 'hormone', 'testosterone', 'bloodwork', 'health', 'injection', 'peptide', 'training', 'recovery', 'body-composition', 'pharmacokinetics', 'female', 'anti-aging', 'ai', 'vision', 'chemistry', 'homebrew'];
  const text = tool.titleEn + ' ' + tool.titleAr + ' ' + tool.slug;
  return keywords.filter(keyword => text.toLowerCase().includes(keyword));
}

function findRelatedTools(tool: any): string[] {
  const sameCategory = TOOL_REGISTRY.filter(t => 
    t.slug.startsWith(tool.slug.split('-')[0]) && t.toolId !== tool.toolId
  );
  return sameCategory.slice(0, 3).map(t => t.slug);
}

function assessDifficulty(tool: any): string {
  const complexKeywords = ['pharmacokinetics', 'reconstitution', 'peptide', 'insulin', 'homebrew'];
  const text = tool.titleEn + ' ' + tool.slug;
  
  if (complexKeywords.some(k => text.toLowerCase().includes(k))) return 'advanced';
  if (tool.slug.includes('nutrition') || tool.slug.includes('body') || tool.slug.includes('macro')) return 'beginner';
  return 'intermediate';
}

function estimateTime(tool: any): number {
  if (tool.slug.includes('nutrition') || tool.slug.includes('body') || tool.slug.includes('macro')) return 2;
  if (tool.slug.includes('pharmacokinetics') || tool.slug.includes('injection')) return 5;
  return 3;
}

export function searchToolsAI(query: string, limit = 10): any[] {
  const queryLower = query.toLowerCase();
  return aiToolsRegistry
    .filter(tool => 
      tool.titleEn.toLowerCase().includes(queryLower) ||
      tool.titleAr.includes(queryLower) ||
      tool.aiTags.some(tag => tag.includes(queryLower))
    )
    .slice(0, limit);
}

export function getAIRecommendations(currentTool: any): any[] {
  const sameCategory = aiToolsRegistry.filter(t => 
    t.slug.startsWith(currentTool.slug.split('-')[0]) && t.toolId !== currentTool.toolId
  );
  return sameCategory.slice(0, 5);
}