'use client';

import { useOrders, type Order } from '../../lib/ordersStore';

function fmt(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function OrderCard({ order }: { order: Order }) {
  const { markPickedUp } = useOrders();
  const isPicked = order.pickupStatus === 'picked_up';

  // Earliest pickup time across items
  const pickupDate = order.items.reduce<Date | null>((earliest, item) => {
    const d = new Date(item.pickupStart);
    return !earliest || d < earliest ? d : earliest;
  }, null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400">Ordered {fmtDate(order.placedAt)}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: '#1a3a2a' }}>
            {order.items.length === 1
              ? order.items[0].title
              : `${order.items[0].title} +${order.items.length - 1} more`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-extrabold tabular-nums" style={{ color: order.total === 0 ? '#16a34a' : '#1a3a2a' }}>
            {fmt(order.total)}
          </span>
          {isPicked ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Picked Up
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              ⏳ Pending Pickup
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {order.items.map(item => (
          <div key={item.listingId} className="flex items-center gap-2">
            <span className="text-lg shrink-0">{item.emoji}</span>
            <span className="text-xs text-gray-600 flex-1 truncate">{item.title}</span>
            <span className="text-xs text-gray-400">×{item.quantity}</span>
            <span className="text-xs font-semibold shrink-0" style={{ color: item.price === 0 ? '#16a34a' : '#374151' }}>
              {item.price === 0 ? 'Free' : fmt(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Pickup info */}
      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <span className="font-semibold text-gray-700">Pickup window: </span>
            {pickupDate ? fmtDateTime(order.items.reduce((earliest, i) =>
              new Date(i.pickupStart) < new Date(earliest) ? i.pickupStart : earliest,
              order.items[0].pickupStart
            )) : '—'}
          </span>
        </div>

        {isPicked && order.pickedUpAt && (
          <div className="flex items-center gap-2 text-xs text-green-700">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <span className="font-semibold">Picked up: </span>
              {fmtDateTime(order.pickedUpAt)}
            </span>
          </div>
        )}
      </div>

      {/* Mark picked up button */}
      {!isPicked && (
        <button
          onClick={() => markPickedUp(order.id)}
          className="w-full rounded-xl border border-dashed border-gray-300 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-colors"
        >
          Mark as Picked Up
        </button>
      )}
    </div>
  );
}

export default function ProfileOrders() {
  const { orders } = useOrders();

  return (
    <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-5 space-y-4">
      <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-3xl">🧺</p>
          <p className="text-sm text-gray-400">No orders yet. Start exploring dishes!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
