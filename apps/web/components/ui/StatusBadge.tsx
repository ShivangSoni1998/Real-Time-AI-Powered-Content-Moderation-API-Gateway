import React from 'react';
import { UI_TEXT } from '../../lib/constants';

interface StatusBadgeProps {
    status: 'APPROVED' | 'FLAGGED' | 'PENDING';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const isApproved = status === UI_TEXT.APPROVED;
    const isPending = status === 'PENDING';

    let styles = 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    if (isApproved) {
        styles = 'bg-green-500/10 text-green-400 border border-green-500/20';
    } else if (status === UI_TEXT.FLAGGED) {
        styles = 'bg-red-500/10 text-red-400 border border-red-500/20';
    } else if (isPending) {
        styles = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse';
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${styles}`}>
            {status}
        </span>
    );
};
