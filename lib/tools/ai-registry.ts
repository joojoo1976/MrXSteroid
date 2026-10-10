import { TOOL_REGISTRY, ToolDefinition } from '@/lib/tools/registry';
import { getCategoryOfSlug } from '@/lib/tools/categories';

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
  // REAL category (hierarchical hrefs depend on it) — not the slug-prefix hack.
  category: getCategoryOfSlug(tool.slug) ?? 'uncategorized',
  aiTags: generateAITags(tool),
  aiDescription: 'Advanced ' + tool.titleEn + ' for precise ' + tool.slug.replace('-', ' ') + ' calculations. ' + tool.titleEn,
  relatedTools: findRelatedTools(tool),
  difficultyLevel: assessDifficulty(tool),
  estimatedTime: estimateTime(tool),
}));

function generateAITags(tool: ToolDefinition): string[] {
  const keywords = ['nutrition', 'macro', 'calorie', 'protein', 'hormone', 'testosterone', 'bloodwork', 'health', 'injection', 'peptide', 'training', 'recovery', 'body-composition', 'pharmacokinetics', 'female', 'anti-aging', 'ai', 'vision', 'chemistry', 'homebrew'];
  const text = tool.titleEn + ' ' + tool.titleAr + ' ' + tool.slug;
  return keywords.filter(keyword => text.toLowerCase().includes(keyword));
}

function findRelatedTools(tool: ToolDefinition): string[] {
  // Category-aware via the REAL category map — the previous slug-prefix hack
  // (slug.split('-')[0] === 'tool') matched every tool in the registry.
  const cat = getCategoryOfSlug(tool.slug);
  if (!cat) return [];
  const sameCategory = TOOL_REGISTRY.filter(
    (t) => t.toolId !== tool.toolId && getCategoryOfSlug(t.slug) === cat,
  );
  return sameCategory.slice(0, 3).map((t) => t.slug);
}

function assessDifficulty(tool: ToolDefinition): 'beginner' | 'intermediate' | 'advanced' {
  const complexKeywords = ['pharmacokinetics', 'reconstitution', 'peptide', 'insulin', 'homebrew'];
  const text = tool.titleEn + ' ' + tool.slug;

  if (complexKeywords.some(k => text.toLowerCase().includes(k))) return 'advanced';
  if (tool.slug.includes('nutrition') || tool.slug.includes('body') || tool.slug.includes('macro')) return 'beginner';
  return 'intermediate';
}

function estimateTime(tool: ToolDefinition): number {
  if (tool.slug.includes('nutrition') || tool.slug.includes('body') || tool.slug.includes('macro')) return 2;
  if (tool.slug.includes('pharmacokinetics') || tool.slug.includes('injection')) return 5;
  return 3;
}

export function searchToolsAI(query: string, limit = 10): AIToolDefinition[] {
  const queryLower = query.toLowerCase();
  return aiToolsRegistry
    .filter(tool => 
      tool.titleEn.toLowerCase().includes(queryLower) ||
      tool.titleAr.includes(queryLower) ||
      tool.aiTags.some(tag => tag.includes(queryLower))
    )
    .slice(0, limit);
}

export function getAIRecommendations(currentTool: { slug: string; toolId: string }): AIToolDefinition[] {
  // Category-aware via the REAL category map (see findRelatedTools).
  const cat = getCategoryOfSlug(currentTool.slug);
  if (!cat) return [];
  const sameCategory = aiToolsRegistry.filter(
    (t) => t.toolId !== currentTool.toolId && getCategoryOfSlug(t.slug) === cat,
  );
  return sameCategory.slice(0, 5);
}