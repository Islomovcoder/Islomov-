import React, { useState } from 'react';
import {
  X,
  Package,
  Heart,
  User,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { Order, Product, Language, OrderStatus } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';
import type { User as FirebaseUser } from 'firebase/auth';

interface UserCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  wishlistProducts: Product[];
  currentLang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onRemoveFromWishlist: (id: string) => void;
  currentUser?: FirebaseUser | null;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
}

export const UserCabinetModal: React.FC<UserCabinetModalProps> = ({
  isOpen,
  onClose,
  orders,
  wishlistProducts,
  currentLang,
  onSelectProduct,
  onAddToCart,
  onRemoveFromWishlist,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            {t.status_new}
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
            {t.status_preparing}
          </span>
        );
      case 'shipping':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
            {t.status_shipping}
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            {t.status_delivered}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            {t.status_cancelled}
          </span>
        );
    }
  };

  const getName = (p: Product) => {
    if (currentLang === 'ru') return p.nameRu;
    if (currentLang === 'en') return p.nameEn;
    return p.nameUz;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                {t.cabinetTitle}
              </h2>
              <p className="text-xs text-stone-500">Abdulaziz Islomov (+998 90 123 45 67)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 px-6 pt-3 gap-6 bg-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'orders'
                ? 'border-amber-500 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.myOrders}</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px]">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'wishlist'
                ? 'border-amber-500 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t.myWishlist}</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px]">
              {wishlistProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'profile'
                ? 'border-amber-500 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.myProfile}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200/70">
                      <div>
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-stone-400 block sm:inline sm:ml-2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <span className="text-xs font-bold text-stone-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <img
                            src={item.image}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-800 truncate">{item.name}</p>
                            <p className="text-stone-500 text-[11px]">
                              {item.quantity} dona × {formatCurrency(item.price)}
                              {item.selectedSize ? ` • ${item.selectedSize}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {order.shippingAddress.city}, {order.shippingAddress.street}
                        </span>
                      </div>
                      <span className="uppercase font-semibold text-stone-700">
                        {order.paymentMethod} • {order.paymentStatus === 'paid' ? 'To\'langan' : 'Kutilmoqda'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-stone-500 text-xs">
                  {t.noOrdersYet}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl border border-stone-200 bg-white flex items-center gap-3"
                    >
                      <img
                        src={p.images[0]}
                        alt={getName(p)}
                        className="w-16 h-16 object-cover rounded-xl border border-stone-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {getName(p)}
                        </h4>
                        <p className="text-xs font-black text-amber-600">
                          {formatCurrency(p.discountPrice || p.price)}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              onAddToCart(p);
                              onRemoveFromWishlist(p.id);
                            }}
                            className="px-2.5 py-1 bg-stone-900 text-amber-400 rounded-lg text-[10px] font-bold"
                          >
                            Savatga
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(p.id)}
                            className="text-[10px] text-rose-600 hover:underline"
                          >
                            O'chirish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-stone-500 text-xs">
                  {t.noWishlistYet}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 font-black text-lg flex items-center justify-center">
                          {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">
                          {currentUser.displayName || "Ro'yxatdan o'tgan foydalanuvchi"}
                        </h4>
                        <p className="text-stone-600 text-xs">{currentUser.email}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Firebase orqali tasdiqlangan
                          </span>
                        </div>
                      </div>
                    </div>

                    {onSignOut && (
                      <button
                        onClick={onSignOut}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl font-bold transition"
                      >
                        Chiqish
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Tizimga kirish</h4>
                    <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                      Buyurtmalar tarixi va saralangan sevimlilaringizni saqlab qolish uchun Google orqali kiring.
                    </p>
                  </div>
                  {onSignInWithGoogle && (
                    <button
                      onClick={onSignInWithGoogle}
                      className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2"
                    >
                      <span className="text-amber-400 font-black text-sm">G</span>
                      <span>Google orqali kirish</span>
                    </button>
                  )}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-sm">Yetkazib berish parametrlari</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-400 block mb-0.5">Ism-familiya</label>
                    <input
                      type="text"
                      defaultValue={currentUser?.displayName || 'Abdulaziz Islomov'}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-0.5">Telefon raqam</label>
                    <input
                      type="text"
                      defaultValue="+998 90 123 45 67"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-stone-400 block mb-0.5">Asosiy manzil</label>
                  <input
                    type="text"
                    defaultValue="Toshkent shahri, Amir Temur shoh ko'chasi, 108-uy, 24-xonadon"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-medium"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button className="px-4 py-2 bg-stone-900 text-amber-400 rounded-xl font-bold">
                    Saqlash
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
