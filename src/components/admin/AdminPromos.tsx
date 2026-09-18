import React, { useState } from 'react';
import { Plus, Tag, Trash2, Check, X, Calendar, Percent } from 'lucide-react';
import { PromoCode, Language } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency, savePromoCode, deletePromoCode } from '../../services/storage';

interface AdminPromosProps {
  promos: PromoCode[];
  currentLang: Language;
  onRefresh: () => void;
}

export const AdminPromos: React.FC<AdminPromosProps> = ({ promos, currentLang, onRefresh }) => {
  const t = translations[currentLang];
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(300000);
  const [maxUses, setMaxUses] = useState(100);
  const [expiryDate, setExpiryDate] = useState('2025-12-31');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxUses: Number(maxUses),
      usedCount: 0,
      validUntil: expiryDate,
      isActive: true,
    };

    savePromoCode(newPromo);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    deletePromoCode(id);
    onRefresh();
  };

  const handleToggleActive = (promo: PromoCode) => {
    savePromoCode({ ...promo, isActive: !promo.isActive });
    onRefresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {t.navDiscounts}
          </h1>
          <p className="text-xs text-stone-400">
            Chegirma kodlari, maxsus aksiyalar va kuponlar
          </p>
        </div>

        <button
          onClick={() => {
            setCode('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi promo-kod</span>
        </button>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-amber-400 text-base tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {p.code}
                </span>
                <button
                  onClick={() => handleToggleActive(p)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                    p.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {p.isActive ? 'Faol' : 'Nofaol'}
                </button>
              </div>

              <p className="text-sm font-bold text-stone-100">
                {p.discountType === 'percent'
                  ? `${p.discountValue}% chegirma`
                  : `${formatCurrency(p.discountValue)} chegirma`}
              </p>

              <div className="text-xs text-stone-400 space-y-1 pt-1">
                <p>Minimal buyurtma: {formatCurrency(p.minOrderAmount)}</p>
                <p>
                  Ishlatildi: {p.usedCount} / {p.maxUses} marta
                </p>
                <p className="text-[11px] text-stone-500">Amal qilish muddati: {p.validUntil}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 text-stone-400 hover:text-rose-400 transition text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>O'chirish</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Promo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 text-stone-200 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Yangi promo-kod yaratish</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Kod (Katta harflar bilan) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="YANDEX2025"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-mono font-bold tracking-wider outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Chegirma turi</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-medium"
                  >
                    <option value="percent">Foiz (%)</option>
                    <option value="fixed">Qat'iy summa (so'm)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Miqdori *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-bold outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Minimal buyurtma summasi (so'm)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Maksimal foydalanish</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Muddati</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
