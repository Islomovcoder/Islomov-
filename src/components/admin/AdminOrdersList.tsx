import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  Printer,
  Phone,
  MapPin,
  Eye,
} from 'lucide-react';
import { Order, OrderStatus, Language } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';

interface AdminOrdersListProps {
  orders: Order[];
  currentLang: Language;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdatePaymentStatus: (orderId: string, status: 'paid' | 'pending') => void;
}

export const AdminOrdersList: React.FC<AdminOrdersListProps> = ({
  orders,
  currentLang,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
}) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
            {t.status_new}
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            {t.status_preparing}
          </span>
        );
      case 'shipping':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            {t.status_shipping}
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            {t.status_delivered}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
            {t.status_cancelled}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {t.navOrders}
          </h1>
          <p className="text-xs text-stone-400">
            Jami {orders.length} ta buyurtma qayd etilgan
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buyurtma #, mijoz ismi yoki telefon..."
            className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder:text-stone-500 outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['all', 'new', 'preparing', 'shipping', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700'
              }`}
            >
              {st === 'all'
                ? 'Barchasi'
                : st === 'new'
                ? t.status_new
                : st === 'preparing'
                ? t.status_preparing
                : st === 'shipping'
                ? t.status_shipping
                : st === 'delivered'
                ? t.status_delivered
                : t.status_cancelled}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/40 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Buyurtma</th>
                <th className="py-3 px-4">Mijoz va Manzil</th>
                <th className="py-3 px-4">Mahsulotlar</th>
                <th className="py-3 px-4">Jami summa</th>
                <th className="py-3 px-4">To'lov</th>
                <th className="py-3 px-4">Statusni o'zgartirish</th>
                <th className="py-3 px-4 text-right">Tafsilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-amber-400 block">
                      {o.orderNumber}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-200">{o.customerName}</p>
                    <p className="text-[11px] text-stone-400">{o.customerPhone}</p>
                    <p className="text-[10px] text-stone-500 truncate max-w-xs">
                      {o.shippingAddress.city}, {o.shippingAddress.street}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-stone-300">
                      {o.items.length} xil tovar
                    </span>
                    <span className="text-[11px] text-stone-500 block truncate max-w-xs">
                      {o.items.map((i) => i.name).join(', ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-black text-stone-100">
                    {formatCurrency(o.total)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-stone-800 text-[11px] font-bold text-stone-300 uppercase">
                        {o.paymentMethod}
                      </span>
                      <button
                        onClick={() =>
                          onUpdatePaymentStatus(
                            o.id,
                            o.paymentStatus === 'paid' ? 'pending' : 'paid'
                          )
                        }
                        className={`block text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition ${
                          o.paymentStatus === 'paid'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {o.paymentStatus === 'paid' ? '✓ To\'langan' : '⏳ Kutilmoqda'}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 outline-hidden focus:border-amber-500"
                    >
                      <option value="new">Yangi</option>
                      <option value="preparing">Tayyorlanmoqda</option>
                      <option value="shipping">Yetkazilmoqda</option>
                      <option value="delivered">Yetkazildi</option>
                      <option value="cancelled">Bekor qilindi</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition"
                      title="Ko'rish"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal with Printable Receipt */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 text-stone-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-base font-black text-white">
                  Buyurtma {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-400">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1 text-xs">
              <p className="font-bold text-stone-100">{selectedOrder.customerName}</p>
              <p className="text-stone-300">{selectedOrder.customerPhone}</p>
              <p className="text-stone-400">
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.street}
                {selectedOrder.shippingAddress.apartment
                  ? `, ${selectedOrder.shippingAddress.apartment}`
                  : ''}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-stone-800"
                >
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />
                    <div>
                      <p className="font-semibold text-stone-200">{item.name}</p>
                      <p className="text-stone-500 text-[10px]">
                        {item.quantity} dona × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-100">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-stone-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Yetkazish:</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'BEPUL' : formatCurrency(selectedOrder.deliveryFee)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Chegirma:</span>
                  <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-amber-400 pt-1 border-t border-stone-800">
                <span>Jami:</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop etish (Chek)</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
