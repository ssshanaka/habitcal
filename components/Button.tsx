import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  className = '', 
  icon,
  ...props 
}) => {
  let baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gcal-bg focus:ring-gcal-blue rounded-full";
  
  const variants = {
    primary: "bg-gcal-surface hover:bg-[#3c4043] text-gcal-text shadow-md py-3 px-6 rounded-2xl min-w-[100px]",
    secondary: "bg-transparent hover:bg-gcal-surface text-gcal-text border border-gcal-border hover:border-transparent py-2 px-4 text-sm",
    icon: "p-2 hover:bg-gcal-surface text-gcal-text rounded-full",
    ghost: "bg-transparent hover:bg-gcal-surface text-gcal-text py-2 px-4 text-sm",
  };

  if (variant === 'primary') {
     // Overriding for the specific "Create" button look
     baseStyles += " gap-3";
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  );
};