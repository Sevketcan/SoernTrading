import { ButtonHTMLAttributes } from 'react';
import styles from '../styles/Button.module.css';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
}

export const Button = ({
    variant = 'primary',
    size = 'medium',
    className,
    children,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={clsx(
                styles.button,
                variant === 'secondary' && styles.buttonSecondary,
                size === 'large' && styles.buttonLarge,
                size === 'small' && styles.buttonSmall,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}; 