'use client';

import { ReactNode } from 'react';
import { CartProvider } from '../lib/cartStore';
import CartDrawer from './CartDrawer';
import MobileNav from './MobileNav';
import AIChatBox from './AIChatBox';

// Wraps the entire app so CartProvider, CartDrawer, MobileNav and AIChatBox are globally mounted.
// Kept as a thin client boundary so layout.tsx stays a Server Component.
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <MobileNav />
      <AIChatBox />
    </CartProvider>
  );
}
