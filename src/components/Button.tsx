import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost' | 'gradient';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gcal-blue rounded-full disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gcal-surface-solid hover:bg-gcal-surface text-gcal-text shadow-md hover:shadow-lg py-3 px-6 rounded-2xl min-w-[100px] border border-gcal-border hover:scale-105 active:scale-95",
    secondary: "bg-transparent hover:bg-gcal-surface text-gcal-text border border-gcal-border hover:border-gcal-blue py-2 px-4 text-sm hover:shadow-md",
    icon: "p-2 hover:bg-gcal-surface text-gcal-text rounded-full hover:scale-110 active:scale-95",
    ghost: "bg-transparent hover:bg-gcal-surface/50 text-gcal-text py-2 px-4 text-sm",
    gradient: "bg-gradient-to-r from-gcal-blue to-purple-500 hover:from-gcal-blue-hover hover:to-purple-600 text-white shadow-lg hover:shadow-xl py-3 px-6 rounded-2xl min-w-[100px] hover:scale-105 active:scale-95 font-semibold",
  };

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