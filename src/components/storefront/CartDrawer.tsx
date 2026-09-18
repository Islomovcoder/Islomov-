import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  Truck,
  Sparkles,
} from 'lucide-react';
import { CartItem, Language, StoreSettings } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency, validatePromo } from '../../services/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentLang: Language;
  settings: StoreSettings;
  onUpdateQuantity: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string) => void;
  appliedPromo: string;
  promoDiscount: number;
  onApplyPromo: (code: string, discount: number) => void;
  onOpenCheckout: () => void;
  onStartShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentLang,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  appliedPromo,
  promoDiscount,
  onApplyPromo,
  onOpenCheckout,
  onStartShopping,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discountPrice || item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : settings.standardDeliveryFee;
  const total = Math.max(0, subtotal - promoDiscount + deliveryFee);

  const amountToFreeDelivery = Math.max(0, settings.freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(
    100,
    Math.round((subtotal / settings.freeDeliveryThreshold) * 100)
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = validatePromo(promoInput.trim(), subtotal);
    if (res.valid) {
      onApplyPromo(promoInput.trim().toUpperCase(), res.discount);
      setPromoError('');
    } else {
      setPromoError(res.message || t.promoInvalid);
    }
  };

  const getName = (item: CartItem) => {
    if (currentLang === 'ru') return item.product.nameRu;
    if (currentLang === 'en') return item.product.nameEn;
    return item.product.nameUz;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              {t.yourCart}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        {cart.length > 0 && (
          <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-medium text-stone-700">
              <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
                <Truck className="w-4 h-4 text-amber-600" />
                {isFreeDelivery ? t.freeDeliveryUnlocked : `Yana ${formatCurrency(amountToFreeDelivery)}`}
              </span>
              <span className="font-bold text-amber-700">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
          {cart.length > 0 ? (
            cart.map((item) => {
              const unitPrice = item.product.discountPrice || item.product.price;
              return (
                <div key={item.id} className="py-3.5 flex gap-3 sm:gap-4 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={getName(item)}
                    className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                      {getName(item)}
                    </h4>

                    {/* Variant tags */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      {item.selectedSize && (
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded font-medium">
                          {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="inline-flex items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded font-medium">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-stone-900">
                        {formatCurrency(unitPrice * item.quantity)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition shrink-0"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800">{t.cartEmpty}</h3>
              <p className="text-xs text-stone-500 max-w-xs">{t.cartEmptyDesc}</p>
              <button
                onClick={() => {
                  onClose();
                  onStartShopping();
                }}
                className="px-6 py-2.5 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold shadow-xs hover:bg-stone-800 transition"
              >
                {t.startShopping}
              </button>
            </div>
          )}
        </div>

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50 space-y-3.5">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Promo-kod (BAHOR2025)"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs uppercase font-mono tracking-wider outline-hidden focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold rounded-xl transition"
                >
                  {t.apply}
                </button>
              </div>
              {promoError && (
                <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
              )}
              {appliedPromo && !promoError && (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>
                    "{appliedPromo}" qo'llandi (-{formatCurrency(promoDiscount)})
                  </span>
                </p>
              )}
            </form>

            {/* Price Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200/80 pt-2">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t.discount}</span>
                  <span>-{formatCurrency(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.deliveryFee}</span>
                <span className="font-semibold text-stone-800">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">{t.deliveryFree}</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-2 border-t border-stone-200">
                <span>{t.totalToPay}</span>
                <span className="text-base text-stone-950">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 active:scale-98"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
