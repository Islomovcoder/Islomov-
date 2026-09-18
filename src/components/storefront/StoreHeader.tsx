import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ShieldCheck,
  Truck,
  Phone,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Language, Product, Category } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';

interface StoreHeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCabinet: () => void;
  onSwitchToAdmin: () => void;
  products: Product[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategory: string | null;
  onSelectProduct: (product: Product) => void;
  currentUser?: FirebaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  isAdmin?: boolean;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  currentLang,
  onLanguageChange,
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenCabinet,
  onSwitchToAdmin,
  products,
  categories,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  selectedCategory,
  onSelectProduct,
  currentUser,
  onSignIn,
  onSignOut,
  isAdmin,
}) => {
  const t = translations[currentLang];
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const getName = (p: Product) => {
    if (currentLang === 'ru') return p.nameRu;
    if (currentLang === 'en') return p.nameEn;
    return p.nameUz;
  };

  const getCatName = (c: Category) => {
    if (currentLang === 'ru') return c.nameRu;
    if (currentLang === 'en') return c.nameEn;
    return c.nameUz;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all shadow-xs">
      {/* Top Banner & Info Bar */}
      <div className="bg-stone-900 text-stone-300 text-xs px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Truck className="w-3.5 h-3.5" />
              <span>{t.freeDeliveryBanner}</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-stone-400">
              <Phone className="w-3 h-3" />
              <span>+998 (71) 200-50-50</span>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800 rounded-md p-0.5 border border-stone-700">
              {(['uz', 'ru', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    currentLang === lang
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Quick Admin Switcher Button */}
            <button
              onClick={onSwitchToAdmin}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-stone-600 transition text-xs font-semibold"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.adminPanel}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onSelectCategory(null)}
              className="text-left flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:sm:h-10 rounded-xl bg-stone-900 flex items-center justify-center text-amber-400 font-black text-lg sm:text-xl shadow-xs group-hover:scale-105 transition-transform">
                S
              </div>
              <div>
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-stone-900 flex items-center">
                  Savdo<span className="text-amber-500">Hub</span>
                </span>
                <span className="hidden sm:block text-[10px] text-stone-700 font-medium leading-none -mt-0.5">
                  Marketplace & Online Store
                </span>
              </div>
            </button>
          </div>

          {/* Category Dropdown Button */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm border transition ${
                categoriesDropdownOpen || selectedCategory
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Menu className="w-4 h-4 text-stone-600" />
              <span>{t.catalog}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                  categoriesDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    setCategoriesDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between ${
                    selectedCategory === null
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>{t.allCategories}</span>
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    {products.length}
                  </span>
                </button>
                <div className="h-px bg-stone-100 my-1" />
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setCategoriesDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{getCatName(cat)}</span>
                    <span className="text-xs text-stone-600">
                      {products.filter((p) => p.categoryId === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar with live popup */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-stone-50 hover:bg-stone-100/80 focus:bg-white text-sm text-stone-900 placeholder:text-stone-600 border border-stone-200 focus:border-amber-500 rounded-xl outline-hidden transition shadow-2xs"
              />
              <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant suggestions list */}
            {showSearchSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="p-2 divide-y divide-stone-100">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectProduct(item);
                          setShowSearchSuggestions(false);
                        }}
                        className="w-full text-left p-2 hover:bg-stone-50 rounded-lg flex items-center gap-3 transition"
                      >
                        <img
                          src={item.images[0]}
                          alt={getName(item)}
                          className="w-11 h-11 object-cover rounded-md border border-stone-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {getName(item)}
                          </p>
                          <p className="text-[11px] text-stone-600">
                            {formatCurrency(item.discountPrice || item.price)}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          {item.sku}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-stone-600">
                    {t.emptyCatalog}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition flex items-center justify-center"
              title={t.wishlist}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cabinet & User Auth */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenCabinet}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                  title={currentUser.displayName || currentUser.email || t.cabinet}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-stone-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">
                    {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                  </span>
                  {isAdmin && (
                    <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 rounded">
                      Admin
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
                title="Google orqali kirish"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Kirish</span>
              </button>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition shadow-xs group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 bg-amber-500 text-stone-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-stone-900">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[10px] text-stone-300 font-medium">
                  {t.cart}
                </span>
                <span className="text-xs font-bold text-white tracking-tight">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
            {t.allCategories}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSelectCategory(null);
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-xs font-medium border ${
                selectedCategory === null
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                  : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}
            >
              {t.allCategories} ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left text-xs font-medium border truncate ${
                  selectedCategory === cat.id
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                {getCatName(cat)}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                onOpenCabinet();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-stone-700 font-medium py-1.5"
            >
              <User className="w-4 h-4 text-stone-500" />
              <span>{t.cabinet}</span>
            </button>
            <button
              onClick={() => {
                onSwitchToAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-amber-600 font-semibold py-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.adminPanel}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
