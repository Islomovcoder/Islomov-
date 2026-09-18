import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Phone, Mail, MapPin, LayoutDashboard } from 'lucide-react';
import { Language, StoreSettings } from '../../types';
import { translations } from '../../data/translations';

interface StoreFooterProps {
  currentLang: Language;
  settings: StoreSettings;
  onSwitchToAdmin: () => void;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({
  currentLang,
  settings,
  onSwitchToAdmin,
}) => {
  const t = translations[currentLang];

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Top Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white">{t.fastDelivery}</h4>
              <p className="text-xs text-stone-400">{t.fastDeliveryDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white">{t.safeShopping}</h4>
              <p className="text-xs text-stone-400">{t.safeShoppingDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white">14 kun qaytarish</h4>
              <p className="text-xs text-stone-400">Kamchilik bo'lsa darhol almashtiramiz</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white">{t.support24}</h4>
              <p className="text-xs text-stone-400">{t.support24Desc}</p>
            </div>
          </div>
        </div>

        {/* Links & Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-stone-900 flex items-center justify-center font-black text-base">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Savdo<span className="text-amber-500">Hub</span>
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed">{t.brandTagline}</p>
            <p className="text-[11px] text-stone-500">
              Telegram: <strong className="text-amber-400">{settings.telegramChannel}</strong>
            </p>
          </div>

          {/* Quick Contacts */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-sm">Bog'lanish</h5>
            <ul className="space-y-2 text-stone-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Payment Systems & Security */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-sm">To'lov tizimlari</h5>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-stone-800 rounded-lg text-cyan-400 font-bold border border-stone-700">
                Payme
              </span>
              <span className="px-2.5 py-1 bg-stone-800 rounded-lg text-blue-400 font-bold border border-stone-700">
                Click
              </span>
              <span className="px-2.5 py-1 bg-stone-800 rounded-lg text-amber-300 font-bold border border-stone-700">
                Uzcard
              </span>
              <span className="px-2.5 py-1 bg-stone-800 rounded-lg text-emerald-400 font-bold border border-stone-700">
                Humo
              </span>
              <span className="px-2.5 py-1 bg-stone-800 rounded-lg text-white font-bold border border-stone-700">
                Naqd pul
              </span>
            </div>
          </div>

          {/* Admin Switcher */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-sm">Boshqaruv</h5>
            <p className="text-stone-400 text-xs">
              Do'kon administratori va menejerlari uchun boshqaruv paneli.
            </p>
            <button
              onClick={onSwitchToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin panelga o'tish</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} SavdoHub Platformasi. {t.allRightsReserved}</p>
          <p className="text-[11px]">Production-Ready E-Commerce & Management System</p>
        </div>
      </div>
    </footer>
  );
};
