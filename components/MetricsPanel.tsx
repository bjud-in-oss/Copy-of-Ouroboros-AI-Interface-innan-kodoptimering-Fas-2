import React from 'react';
import { ModelMetrics } from '../types';
import { Activity, Clock, Zap } from 'lucide-react';

interface Props {
    metrics: ModelMetrics[];
}

const MetricsPanel: React.FC<Props> = ({ metrics }) => {
    const totalPromptTokens = metrics.reduce((acc, m) => acc + m.promptTokens, 0);
    const totalCandidateTokens = metrics.reduce((acc, m) => acc + m.candidateTokens, 0);
    const totalTimeMs = metrics.reduce((acc, m) => acc + m.durationMs, 0);

    return (
        <div className="h-full flex flex-col font-mono text-xs overflow-hidden">
             <div className="mb-4 grid grid-cols-3 gap-4 shrink-0">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col">
                    <span className="text-zinc-500 mb-1 flex items-center gap-1.5"><Zap size={14} /> Total Tokens</span>
                    <span className="text-xl text-zinc-200 font-bold">{totalPromptTokens + totalCandidateTokens}</span>
                    <span className="text-zinc-600 mt-1">P: {totalPromptTokens} / C: {totalCandidateTokens}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col">
                    <span className="text-zinc-500 mb-1 flex items-center gap-1.5"><Clock size={14} /> Total Time</span>
                    <span className="text-xl text-zinc-200 font-bold">{(totalTimeMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col">
                    <span className="text-zinc-500 mb-1 flex items-center gap-1.5"><Activity size={14} /> Requests</span>
                    <span className="text-xl text-zinc-200 font-bold">{metrics.length}</span>
                </div>
             </div>

             <div className="flex-1 overflow-auto rounded-lg border border-zinc-800 bg-zinc-900 relative custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-10 text-zinc-400">
                        <tr>
                            <th className="font-normal py-2 px-4">Time</th>
                            <th className="font-normal py-2 px-4">Model</th>
                            <th className="font-normal py-2 px-4">Turns</th>
                            <th className="font-normal py-2 px-4">Duration</th>
                            <th className="font-normal py-2 px-4">Tokens (P/C)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map(m => (
                            <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                <td className="py-2 px-4 text-zinc-500">{new Date(m.timestamp).toLocaleTimeString()}</td>
                                <td className="py-2 px-4 text-indigo-400">{m.modelName}</td>
                                <td className="py-2 px-4">{m.turnCount}</td>
                                <td className="py-2 px-4">{(m.durationMs / 1000).toFixed(1)}s</td>
                                <td className="py-2 px-4">
                                    <span className="text-zinc-300">{m.totalTokens}</span>
                                    <span className="text-zinc-600 ml-1">({m.promptTokens}/{m.candidateTokens})</span>
                                </td>
                            </tr>
                        ))}
                        {metrics.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-zinc-600 italic">No operational metrics recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

export default MetricsPanel;
