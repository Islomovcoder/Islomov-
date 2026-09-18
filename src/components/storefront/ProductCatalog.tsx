import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, RotateCcw, Search, Sparkles } from 'lucide-react';
import { Product, Category, Language } from '../../types';
import { ProductCard } from './ProductCard';
import { translations } from '../../data/translations';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  currentLang: Language;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: { name: string; hex: string }) => void;
  onSelectProduct: (product: Product) => void;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  currentLang,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const t = translations[currentLang];

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const getCatName = (c: Category) => {
    if (currentLang === 'ru') return c.nameRu;
    if (currentLang === 'en') return c.nameEn;
    return c.nameUz;
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
      // Subcategory filter
      if (selectedSubcat && p.subcategoryId !== selectedSubcat) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUz = p.nameUz.toLowerCase().includes(q);
        const matchesRu = p.nameRu.toLowerCase().includes(q);
        const matchesEn = p.nameEn.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesUz && !matchesRu && !matchesEn && !matchesSku) return false;
      }
      // Stock filter
      if (inStockOnly && p.stock <= 0) return false;
      // Rating filter
      if (minRating > 0 && p.rating < minRating) return false;
      // Price range filter
      const effectivePrice = p.discountPrice || p.price;
      if (effectivePrice < priceRange[0] || effectivePrice > priceRange[1]) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.reviewsCount - a.reviewsCount; // popular
    });
  }, [products, selectedCategoryId, selectedSubcat, searchQuery, inStockOnly, minRating, priceRange, sortBy]);

  const handleResetFilters = () => {
    onSelectCategory(null);
    setSelectedSubcat(null);
    setInStockOnly(false);
    setMinRating(0);
    setPriceRange([0, 20000000]);
    onSearchChange('');
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedCategoryId !== null ||
    selectedSubcat !== null ||
    inStockOnly ||
    minRating > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 20000000 ||
    searchQuery.trim().length > 0;

  return (
    <div id="catalog-section" className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header & Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {selectedCategoryObj ? getCatName(selectedCategoryObj) : t.allCategories}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">
              {filteredProducts.length} {t.itemsCount}
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-stone-500 mt-1">
              Qidiruv natijalari: <strong className="text-stone-800">"{searchQuery}"</strong>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtrlar</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-none outline-hidden cursor-pointer text-stone-800 font-semibold"
            >
              <option value="popular">{t.sortPopular}</option>
              <option value="newest">{t.sortNewest}</option>
              <option value="price_asc">{t.sortPriceAsc}</option>
              <option value="price_desc">{t.sortPriceDesc}</option>
              <option value="rating">{t.sortRating}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Grid & Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-stone-50/50 p-5 rounded-2xl border border-stone-200/80 self-start">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              Filtrlar
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {t.resetFilters}
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.allCategories}
            </p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectCategory(null);
                  setSelectedSubcat(null);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                  selectedCategoryId === null
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{t.allCategories}</span>
                <span>{products.length}</span>
              </button>

              {categories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setSelectedSubcat(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategoryId === cat.id
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{getCatName(cat)}</span>
                    <span className="text-[11px] opacity-75">
                      {products.filter((p) => p.categoryId === cat.id).length}
                    </span>
                  </button>

                  {/* Subcategories (if parent selected) */}
                  {selectedCategoryId === cat.id && cat.subcategories.length > 0 && (
                    <div className="pl-4 space-y-0.5 border-l-2 border-amber-200 ml-2">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubcat(selectedSubcat === sub.id ? null : sub.id)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                            selectedSubcat === sub.id
                              ? 'text-amber-700 font-bold bg-amber-50'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {currentLang === 'ru' ? sub.nameRu : currentLang === 'en' ? sub.nameEn : sub.nameUz}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* In-stock toggle */}
          <div className="pt-4 border-t border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
              />
              <span>{t.inStockOnly}</span>
            </label>
          </div>

          {/* Rating filter */}
          <div className="pt-4 border-t border-stone-200 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.filterByRating}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 4.5, 4.8].map((ratingVal) => (
                <button
                  key={ratingVal}
                  onClick={() => setMinRating(ratingVal)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                    minRating === ratingVal
                      ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {ratingVal === 0 ? 'Barchasi' : `${ratingVal} ★+`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentLang={currentLang}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-4 bg-stone-50 rounded-3xl border border-dashed border-stone-200 p-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                {t.emptyCatalog}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Qidiruv so'zini yoki belgilangan filtrlarni o'zgartirib ko'ring
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold shadow-xs transition"
              >
                {t.resetFilters}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                  Filtrlar
                </span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t.allCategories}
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      setSelectedSubcat(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedCategoryId === null
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    {t.allCategories}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setSelectedSubcat(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        selectedCategoryId === cat.id
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-50 text-stone-700'
                      }`}
                    >
                      {getCatName(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
                />
                <span>{t.inStockOnly}</span>
              </label>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
              >
                {t.resetFilters}
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
              >
                Natijalar ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
