import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider = ({ children }) => (
  <>
    {children}
    <Toaster position="top-right" toastOptions={{
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
      },
    }} />
  </>
);
