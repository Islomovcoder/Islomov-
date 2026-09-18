import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Camera,
  Plus,
  ArrowUpRight,
  Package,
  Calendar,
  Clock,
} from 'lucide-react';
import { Product, Order, Language, Customer } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  currentLang: Language;
  onOpenNewProduct: () => void;
  onOpenOrders: () => void;
  onEditProduct: (p: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  customers,
  currentLang,
  onOpenNewProduct,
  onOpenOrders,
  onEditProduct,
}) => {
  const t = translations[currentLang];

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const avgCheck = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const lowStockProducts = products.filter((p) => p.stock <= 4);

  // Recent 4 orders
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {t.adminTitle}
          </h1>
          <p className="text-xs text-stone-400">{t.adminSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewProduct}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>{t.quickCameraAdd}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">{t.totalRevenue}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% o'tgan haftaga nisbatan</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">{t.totalOrders}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {totalOrdersCount} ta
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            <span>Bugun 3 ta yangi buyurtma</span>
          </div>
        </div>

        {/* Avg Check */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">{t.avgCheck}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(avgCheck)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            <span>Yuqori xarid qobiliyati</span>
          </div>
        </div>

        {/* Low stock warning card */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">{t.lowStockAlert}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
            {lowStockProducts.length} ta tovar
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
            <span>Omborda to'ldirish talab etiladi</span>
          </div>
        </div>
      </div>

      {/* Analytics Visualization & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Simulation */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-100">Savdo dinamikasi (Oxirgi 7 kun)</h3>
              <p className="text-xs text-stone-400">Har kungi tushum va buyurtmalar taqsimoti</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              Haftalik: {formatCurrency(totalRevenue)}
            </span>
          </div>

          {/* Clean Bar Visualizer */}
          <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-stone-800 pb-2">
            {[
              { day: 'Dush', val: 3200000, height: '40%' },
              { day: 'Sesh', val: 4800000, height: '60%' },
              { day: 'Chor', val: 2900000, height: '35%' },
              { day: 'Pay', val: 6200000, height: '75%' },
              { day: 'Juma', val: 8900000, height: '95%' },
              { day: 'Shan', val: 7400000, height: '80%' },
              { day: 'Yak', val: 5100000, height: '65%' },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition font-mono">
                  {formatCurrency(d.val)}
                </span>
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg group-hover:brightness-125 transition"
                  style={{ height: d.height }}
                />
                <span className="text-[11px] font-semibold text-stone-400">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>Barcha summativ ma'lumotlar real vaqt rejimida yangilanadi</span>
            <span className="text-stone-300 font-medium">Jami mahsulotlar: {products.length} ta</span>
          </div>
        </div>

        {/* Low Stock Warning Feed */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{t.lowStockAlert}</span>
            </h3>
            <p className="text-xs text-stone-400">Tez orada tugaydigan tovarlar ro'yxati</p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-56">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onEditProduct(p)}
                className="p-2.5 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 flex items-center justify-between gap-3 cursor-pointer transition"
              >
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-9 h-9 object-cover rounded-lg border border-stone-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-200 truncate">{p.nameUz}</p>
                  <p className="text-[11px] font-mono text-stone-400">{p.sku}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold text-xs border border-rose-500/30">
                  {p.stock} dona
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onOpenNewProduct}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 transition"
          >
            Tovarlar qoldig'ini to'ldirish
          </button>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-100">{t.recentOrders}</h3>
            <p className="text-xs text-stone-400">Do'konga tushgan eng so'nggi xaridlar</p>
          </div>
          <button
            onClick={onOpenOrders}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>{t.seeAll}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold">
                <th className="py-2.5 pr-4">Buyurtma #</th>
                <th className="py-2.5 px-4">Mijoz</th>
                <th className="py-2.5 px-4">Summa</th>
                <th className="py-2.5 px-4">To'lov</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 pl-4">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-800/40 transition">
                  <td className="py-3 pr-4 font-mono font-bold text-amber-400">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-stone-200 font-medium">
                    {o.customerName}
                    <span className="block text-[11px] text-stone-400">{o.customerPhone}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-100">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        o.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : o.status === 'shipping'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : o.status === 'preparing'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-stone-400">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
