import React from 'react';

export const Logo = () => (
  <div className="flex items-center gap-2">
    <img src="/logo.png" alt="DocuAgent" className="w-8 h-8 rounded-md" />
    <h1 className="text-2xl font-bold">
      <span className="text-[var(--color-primary)]">Docu</span>Agent
    </h1>
  </div>
);
export default Logo;
