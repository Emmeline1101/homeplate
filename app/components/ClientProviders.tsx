'use client';

import { ReactNode } from 'react';
import { CartProvider } from '../lib/cartStore';
import CartDrawer from './CartDrawer';

// Wraps the entire app so CartProvider and CartDrawer are globally mounted.
// Kept as a thin client boundary so layout.tsx stays a Server Component.
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
