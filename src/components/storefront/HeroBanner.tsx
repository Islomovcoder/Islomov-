import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, RotateCcw, Tag } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface HeroBannerProps {
  currentLang: Language;
  onExploreClick: () => void;
  onCategorySelect: (categoryId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentLang,
  onExploreClick,
  onCategorySelect,
}) => {
  const t = translations[currentLang];

  const title =
    currentLang === 'uz'
      ? "Eng So'nggi Texnologiya va Moda — Bir Joyda"
      : currentLang === 'ru'
      ? 'Новейшие технологии и премиум стиль — в одном месте'
      : 'Latest Tech & Fashion Essentials — All in One Place';

  const subtitle =
    currentLang === 'uz'
      ? "O'zbekiston bo'ylab 24 soat ichida yetkazib berish. 100% kafolatlangan original mahsulotlar va Payme / Click orqali oson to'lov."
      : currentLang === 'ru'
      ? 'Доставка по всему Узбекистану за 24 часа. 100% оригинальная продукция с гарантией и удобной оплатой Payme / Click.'
      : 'Fast 24-hour express delivery across Uzbekistan. 100% genuine verified products with Payme / Click / Cash payments.';

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-6">
      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white min-h-[360px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-10 border border-stone-800 shadow-xl">
        {/* Ambient background graphic */}
        <div className="absolute inset-0 bg-linear-to-r from-stone-950 via-stone-900/85 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80"
          alt="SavdoHub Showcase"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />

        {/* Content */}
        <div className="relative z-20 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SavdoHub 2025 Collection</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed max-w-xl">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-lg hover:shadow-amber-500/25 active:scale-98"
            >
              <span>{t.startShopping}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Promo Voucher Highlight */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-xs font-semibold text-stone-200 transition">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>
                Promo: <strong className="text-amber-300 font-mono tracking-wider">BAHOR2025</strong> (-15%)
              </span>
            </div>
          </div>
        </div>

        {/* Feature badges row inside banner */}
        <div className="relative z-20 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-white/10 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.fastDelivery}</p>
              <p className="text-[11px] text-stone-400">{t.fastDeliveryDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.safeShopping}</p>
              <p className="text-[11px] text-stone-400">{t.safeShoppingDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.support24}</p>
              <p className="text-[11px] text-stone-400">{t.support24Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
