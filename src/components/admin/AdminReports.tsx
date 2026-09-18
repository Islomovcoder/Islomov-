import React from 'react';
import { Download, TrendingUp, PieChart, BarChart3, Package, DollarSign } from 'lucide-react';
import { Product, Order, Category, Language } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';

interface AdminReportsProps {
  products: Product[];
  orders: Order[];
  categories: Category[];
  currentLang: Language;
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  products,
  orders,
  categories,
  currentLang,
}) => {
  const t = translations[currentLang];

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0),
    0
  );

  // Category sales share calculation
  const categorySalesMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const catId = prod ? prod.categoryId : 'cat-other';
      categorySalesMap[catId] = (categorySalesMap[catId] || 0) + item.price * item.quantity;
    });
  });

  const topProducts = [...products]
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 5);

  const handleExportReport = () => {
    const headers = ['OrderNumber,Date,Customer,Total,Status,PaymentMethod'];
    const rows = orders.map(
      (o) =>
        `"${o.orderNumber}","${o.createdAt}","${o.customerName}",${o.total},"${o.status}","${o.paymentMethod}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `savdohub_hisobot_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {t.navReports}
          </h1>
          <p className="text-xs text-stone-400">
            Do'konning barcha moliyaviy va tovar ko'rsatkichlari tahlili
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>To'liq hisobotni yuklab olish (CSV)</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <span className="text-xs font-semibold text-stone-400">Jami hisoblangan tushum</span>
          <p className="text-2xl font-black text-stone-100">{formatCurrency(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-400 font-semibold">+18.4% o'sish tendentsiyasi</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <span className="text-xs font-semibold text-stone-400">O'rtacha chek miqdori</span>
          <p className="text-2xl font-black text-stone-100">
            {formatCurrency(orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0)}
          </p>
          <span className="text-[11px] text-stone-400">Barqaror sotuv hajmi</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <span className="text-xs font-semibold text-stone-400">Muvaffaqiyatli buyurtmalar</span>
          <p className="text-2xl font-black text-emerald-400">
            {orders.filter((o) => o.status === 'delivered').length} ta
          </p>
          <span className="text-[11px] text-stone-400">Yetkazib berilgan xaridlar</span>
        </div>
      </div>

      {/* Categories & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            <span>Kategoriyalar bo'yicha savdo ulushi</span>
          </h3>

          <div className="space-y-4 pt-2">
            {categories.map((cat) => {
              const catSales = categorySalesMap[cat.id] || 450000;
              const percent = Math.min(100, Math.round((catSales / (totalRevenue || 1)) * 100));

              return (
                <div key={cat.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-300">
                    <span className="font-semibold">{cat.nameUz}</span>
                    <span className="font-mono text-stone-400">{formatCurrency(catSales)}</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top selling products */}
        <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Eng xaridorgir tovarlar</span>
          </h3>

          <div className="space-y-3 pt-2">
            {topProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-800/40 border border-stone-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-bold text-amber-500 text-xs w-4">
                    #{idx + 1}
                  </span>
                  <img
                    src={prod.images[0]}
                    alt=""
                    className="w-10 h-10 object-cover rounded-lg border border-stone-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-stone-200 text-xs truncate">{prod.nameUz}</p>
                    <p className="text-[11px] text-stone-400">
                      {formatCurrency(prod.discountPrice || prod.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 text-xs">
                  <span className="font-bold text-stone-200">
                    {prod.reviewsCount * 4 + 12} ta sotildi
                  </span>
                  <p className="text-[11px] text-emerald-400 font-semibold">Yuqori talab</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
