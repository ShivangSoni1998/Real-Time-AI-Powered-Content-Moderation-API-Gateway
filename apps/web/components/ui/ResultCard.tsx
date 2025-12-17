import React from 'react';
import { StatusBadge } from './StatusBadge';
import { UI_TEXT } from '../../lib/constants';

interface ResultCardProps {
    submissionId: string;
    status: 'APPROVED' | 'FLAGGED' | 'PENDING';
    reason?: string;
    confidence: number;
    originalContent: string;
    timestamp: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
    status,
    reason,
    confidence,
    originalContent,
    timestamp,
}) => {
    const isPending = status === 'PENDING';
    const isApproved = status === UI_TEXT.APPROVED;

    let borderStyles = 'bg-gray-800/50 border-gray-700';
    if (isApproved) {
        borderStyles = 'bg-gray-800/50 border-green-500/20 hover:border-green-500/40';
    } else if (status === UI_TEXT.FLAGGED) {
        borderStyles = 'bg-gray-800/50 border-red-500/20 hover:border-red-500/40';
    } else if (isPending) {
        borderStyles = 'bg-gray-800/30 border-yellow-500/20 animate-pulse';
    }

    return (
        <div className={`p-6 rounded-xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${borderStyles}`}>
            <div className="flex justify-between items-start mb-3">
                {isPending ? (
                    <div className="flex items-center gap-2 text-yellow-500">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Analyzing...</span>
                    </div>
                ) : (
                    <StatusBadge status={status} />
                )}
                <span className="text-xs text-gray-500 font-mono">
                    {new Date(timestamp).toLocaleTimeString()}
                </span>
            </div>

            <p className="text-gray-200 text-lg mb-3 leading-relaxed">{originalContent}</p>

            {status === UI_TEXT.FLAGGED && (
                <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                    <p className="text-sm text-red-300 flex items-center gap-2">
                        <span className="font-semibold">Reason:</span> {reason}
                    </p>
                    <p className="text-sm text-red-300/70 mt-1">
                        Confidence: {(confidence * 100).toFixed(1)}%
                    </p>
                </div>
            )}
        </div>
    );
};
