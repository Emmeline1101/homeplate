'use client';

import { ReactNode } from 'react';
import { CartProvider } from '../lib/cartStore';
import { OrdersProvider } from '../lib/ordersStore';
import CartDrawer from './CartDrawer';
import MobileNav from './MobileNav';
import AIChatBox from './AIChatBox';

// Wraps the entire app so CartProvider, OrdersProvider, CartDrawer, MobileNav and AIChatBox are globally mounted.
// Kept as a thin client boundary so layout.tsx stays a Server Component.
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <OrdersProvider>
        {children}
        <CartDrawer />
        <MobileNav />
        <AIChatBox />
      </OrdersProvider>
    </CartProvider>
  );
}
