'use client';

import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CartItem = {
  listingId: string;
  title: string;
  cuisine: string;
  cook: string;
  emoji: string;
  price: number;       // cents per portion
  quantity: number;
  maxPortions: number;
  pickupStart: string;
  pickupEnd: string;
};

type Action =
  | { type: 'ADD';      item: CartItem }
  | { type: 'REMOVE';   id: string }
  | { type: 'SET_QTY';  id: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE';  items: CartItem[] };

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const idx = state.findIndex(i => i.listingId === action.item.listingId);
      if (idx >= 0) {
        const next = [...state];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(next[idx].quantity + action.item.quantity, next[idx].maxPortions),
        };
        return next;
      }
      return [...state, action.item];
    }
    case 'REMOVE':
      return state.filter(i => i.listingId !== action.id);
    case 'SET_QTY':
      if (action.qty <= 0) return state.filter(i => i.listingId !== action.id);
      return state.map(i =>
        i.listingId === action.id
          ? { ...i, quantity: Math.min(action.qty, i.maxPortions) }
          : i
      );
    case 'CLEAR':
      return [];
    case 'HYDRATE':
      return action.items;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

type CartCtx = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartCtx | null>(null);
const LS_KEY = 'homebites_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) dispatch({ type: 'HYDRATE', items: JSON.parse(raw) as CartItem[] });
    } catch { /* ignore */ }
  }, []);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      addItem:    (item)     => dispatch({ type: 'ADD',     item }),
      removeItem: (id)       => dispatch({ type: 'REMOVE',  id }),
      setQty:     (id, qty)  => dispatch({ type: 'SET_QTY', id, qty }),
      clear:      ()         => dispatch({ type: 'CLEAR' }),
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
      drawerOpen,
      openDrawer:  () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
