import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'px-6 py-2 rounded-lg font-medium transition-all shadow-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20',
        secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
        danger: 'bg-red-600 hover:bg-red-500 text-white hover:shadow-red-500/20',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};
