// src/components/ui/Button.tsx
'use client';

/**
 * 汎用ボタンコンポーネント
 *
 * バリアント、サイズ、ローディング状態をサポート
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// 型定義
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** ボタンのスタイルバリアント */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    /** ボタンのサイズ */
    size?: 'sm' | 'md' | 'lg';
    /** ローディング状態 */
    isLoading?: boolean;
    /** アイコン（左側） */
    leftIcon?: React.ReactNode;
    /** アイコン（右側） */
    rightIcon?: React.ReactNode;
}

// ============================================================
// スタイル定義
// ============================================================

const variantStyles = {
    primary:
        'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl',
    secondary:
        'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg hover:shadow-xl',
    outline:
        'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger:
        'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg hover:shadow-xl',
} as const;

const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5',
} as const;

// ============================================================
// コンポーネント
// ============================================================

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || isLoading;

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center font-semibold rounded-xl',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                'active:scale-[0.98]',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={isDisabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={size === 'lg' ? 22 : size === 'sm' ? 14 : 18} />
            ) : (
                leftIcon
            )}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
}
