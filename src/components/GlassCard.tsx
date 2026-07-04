import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div
      className={`backdrop-blur-[40px] bg-[rgba(255,255,255,0.25)] border border-[rgba(255,255,255,0.3)] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08),_inset_0_1px_0_rgba(255,255,255,0.3)] ${className}`}
    >
      {children}
    </div>
  );
};
