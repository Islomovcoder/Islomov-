import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  User,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CartItem,
  Language,
  Order,
  PaymentMethod,
  StoreSettings,
} from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency, createOrder } from '../../services/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentLang: Language;
  settings: StoreSettings;
  appliedPromo: string;
  promoDiscount: number;
  onOrderSuccess: (order: Order) => void;
  onOpenCabinet: () => void;
}

const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Buxoro viloyati',
  'Farg\'ona viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Qoraqalpog\'iston Respublikasi',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentLang,
  settings,
  appliedPromo,
  promoDiscount,
  onOrderSuccess,
  onOpenCabinet,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];

  // Form states
  const [fullName, setFullName] = useState('Abdulaziz Islomov');
  const [phone, setPhone] = useState('+998 90 123 45 67');
  const [email, setEmail] = useState('abdulaziz@example.uz');
  const [city, setCity] = useState('Toshkent shahri');
  const [street, setStreet] = useState('Amir Temur shoh ko\'chasi, 108-uy');
  const [apartment, setApartment] = useState('24-xonadon');
  const [landmark, setLandmark] = useState('Metro yaqinida');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payme');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discountPrice || item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold && deliveryType === 'standard';
  const deliveryFee =
    deliveryType === 'express'
      ? settings.expressDeliveryFee
      : isFreeDelivery
      ? 0
      : settings.standardDeliveryFee;

  const total = Math.max(0, subtotal - promoDiscount + deliveryFee);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !street.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderNumber = `SH-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        shippingAddress: {
          city,
          street: street.trim(),
          apartment: apartment.trim(),
          landmark: landmark.trim(),
        },
        deliveryType,
        deliveryFee,
        items: cart.map((i) => ({
          productId: i.product.id,
          name: i.product.nameUz,
          price: i.product.discountPrice || i.product.price,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor?.name,
          image: i.product.images[0],
        })),
        subtotal,
        discountAmount: promoDiscount,
        promoCode: appliedPromo || undefined,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createOrder(newOrder);
      onOrderSuccess(newOrder);
      setCreatedOrder(newOrder);
      setIsSubmitting(false);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error('Confetti error', err);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                {createdOrder ? t.orderSuccessTitle : t.checkoutTitle}
              </h2>
              <p className="text-[11px] text-stone-500">SavdoHub xavfsiz to'lov tizimi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Form OR Success Confirmation */}
        <div className="overflow-y-auto p-5 sm:p-7">
          {createdOrder ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                  {t.orderNumberLabel}: {createdOrder.orderNumber}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  {t.orderSuccessTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  {t.orderSuccessDesc}
                </p>
              </div>

              {/* Order quick summary box */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold text-stone-800 pb-2 border-b border-stone-200">
                  <span>Yetkazish manzili:</span>
                  <span className="text-stone-600 font-normal">
                    {createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.street}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-stone-800 pb-2 border-b border-stone-200">
                  <span>To'lov usuli:</span>
                  <span className="uppercase text-amber-600 font-extrabold">
                    {createdOrder.paymentMethod} ({createdOrder.paymentStatus === 'paid' ? 'To\'langan' : 'Kutilmoqda'})
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-stone-900 text-sm pt-1">
                  <span>Jami to'lov:</span>
                  <span className="text-amber-600">{formatCurrency(createdOrder.total)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCabinet();
                  }}
                  className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs shadow-md transition"
                >
                  {t.trackInCabinet}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition"
                >
                  {t.continueShopping}
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.contactInfo}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alisher Navoiy"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">
                      {t.phone} *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 font-medium block mb-1">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="namuna@domain.uz"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.deliveryAddress}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">
                      {t.cityRegion} *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500 focus:bg-white font-medium"
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">
                      {t.streetAndHouse} *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Amir Temur ko'chasi, 24-uy"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">
                      {t.apartment}
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="12-xonadon, 3-qavat"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">
                      {t.landmark}
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Grand Mir mehmonxonasi ro'parasida"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Speed / Option */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.deliveryType}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setDeliveryType('standard')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      deliveryType === 'standard'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'standard'}
                      onChange={() => setDeliveryType('standard')}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        {t.deliveryStandard}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {isFreeDelivery ? 'BEPUL' : formatCurrency(settings.standardDeliveryFee)}
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setDeliveryType('express')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      deliveryType === 'express'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'express'}
                      onChange={() => setDeliveryType('express')}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        {t.deliveryExpress}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {formatCurrency(settings.expressDeliveryFee)}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.paymentMethod}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Payme */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('payme')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'payme'
                        ? 'border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-500'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="font-black text-cyan-600 text-sm">payme</span>
                    <span className="text-[10px] text-stone-500 font-medium">To'lov</span>
                  </button>

                  {/* Click */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('click')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'click'
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="font-black text-blue-600 text-sm">click</span>
                    <span className="text-[10px] text-stone-500 font-medium">To'lov</span>
                  </button>

                  {/* Uzcard */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('uzcard')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'uzcard'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="font-black text-amber-700 text-sm">UZCARD</span>
                    <span className="text-[10px] text-stone-500 font-medium">Humo / Karta</span>
                  </button>

                  {/* Cash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="font-black text-emerald-700 text-sm">NAQD</span>
                    <span className="text-[10px] text-stone-500 font-medium">Kuryerga</span>
                  </button>
                </div>
              </div>

              {/* Order Price Summary */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>{t.subtotal} ({cart.length} {t.itemsCount})</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t.discount}</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>{t.deliveryFee}</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? 'BEPUL' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>{t.totalToPay}</span>
                  <span className="text-base text-amber-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Buyurtma qayta ishlanmoqda...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.confirmOrder} ({formatCurrency(total)})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
