'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AIToolDefinition, getAIRecommendations } from '@/lib/tools/ai-registry';

interface ToolNavigationProps {
  currentTool: AIToolDefinition;
  totalTools: number;
}

export function AIToolNavigation({ currentTool, totalTools }: ToolNavigationProps) {
  const router = useRouter();
  const prevToolId = currentTool.id - 1;
  const nextToolId = currentTool.id + 1;
  const aiRecommendations = getAIRecommendations(currentTool);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-4 z-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => prevToolId >= 1 && router.push(`/smarttools/${currentTool.category}/tool-${prevToolId}`)}
            disabled={prevToolId < 1}
            className="px-6 py-3 bg-zinc-900/50 hover:bg-zinc-800/50 disabled:opacity-50 rounded-xl border border-white/10"
          >
            ← Previous #{prevToolId}
          </button>

          <div className="text-center">
            <div className="text-[#39FF14] font-bold text-lg">
              Tool #{currentTool.id} of {totalTools}
            </div>
            <div className="text-gray-400 text-sm">{currentTool.category}</div>
          </div>

          <button
            onClick={() => nextToolId <= totalTools && router.push(`/smarttools/${currentTool.category}/tool-${nextToolId}`)}
            disabled={nextToolId > totalTools}
            className="px-6 py-3 bg-[#39FF14] hover:bg-[#39FF14]/80 disabled:opacity-50 rounded-xl border border-white/10 text-black font-bold"
          >
            Next #{nextToolId} →
          </button>
        </div>

        {aiRecommendations.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#39FF14]">🤖</span>
              <span className="font-bold text-[#39FF14]">AI Recommendations</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {aiRecommendations.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => router.push(`/smarttools/${tool.category}/${tool.slug}`)}
                  className="p-3 bg-zinc-900/50 hover:bg-zinc-800/50 rounded-xl border border-white/10 text-left"
                >
                  <div className="text-[#39FF14] text-xs font-bold mb-1">#{tool.id}</div>
                  <div className="text-white text-sm line-clamp-2">{tool.nameEn}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}