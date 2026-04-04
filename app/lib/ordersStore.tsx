'use client';

import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderItem = {
  listingId: string;
  title: string;
  cuisine: string;
  cook: string;
  emoji: string;
  price: number;       // cents per portion
  quantity: number;
  pickupStart: string;
  pickupEnd: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;            // cents (0 = fully free)
  placedAt: string;         // ISO date string
  pickupStatus: 'pending' | 'picked_up';
  pickedUpAt?: string;      // ISO date string, set when marked picked up
};

type Action =
  | { type: 'ADD_ORDER';     order: Order }
  | { type: 'MARK_PICKED_UP'; id: string; at: string }
  | { type: 'HYDRATE';       orders: Order[] };

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: Order[], action: Action): Order[] {
  switch (action.type) {
    case 'ADD_ORDER':
      return [action.order, ...state];
    case 'MARK_PICKED_UP':
      return state.map(o =>
        o.id === action.id
          ? { ...o, pickupStatus: 'picked_up', pickedUpAt: action.at }
          : o
      );
    case 'HYDRATE':
      return action.orders;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

type OrdersCtx = {
  orders: Order[];
  addOrder: (order: Order) => void;
  markPickedUp: (id: string) => void;
};

const OrdersContext = createContext<OrdersCtx | null>(null);
const LS_KEY = 'homeplate_orders_v1';

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) dispatch({ type: 'HYDRATE', orders: JSON.parse(raw) as Order[] });
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  return (
    <OrdersContext.Provider value={{
      orders,
      addOrder: (order) => dispatch({ type: 'ADD_ORDER', order }),
      markPickedUp: (id) => dispatch({ type: 'MARK_PICKED_UP', id, at: new Date().toISOString() }),
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used inside <OrdersProvider>');
  return ctx;
}
