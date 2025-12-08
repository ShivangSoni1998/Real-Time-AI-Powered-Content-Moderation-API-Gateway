import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
            <textarea
                className={`w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${className}`}
                {...props}
            />
        </div>
    );
};
