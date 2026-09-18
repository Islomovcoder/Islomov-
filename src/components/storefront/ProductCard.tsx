import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye, Check } from 'lucide-react';
import { Product, Language } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';

interface ProductCardProps {
  product: Product;
  currentLang: Language;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: { name: string; hex: string }) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentLang,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  const t = translations[currentLang];
  const [justAdded, setJustAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const getName = () => {
    if (currentLang === 'ru') return product.nameRu;
    if (currentLang === 'en') return product.nameEn;
    return product.nameUz;
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(
      product,
      product.sizes.length > 0 ? product.sizes[0] : undefined,
      product.colors.length > 0 ? product.colors[0] : undefined
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Image Container */}
      <div
        className="relative w-full aspect-square bg-stone-100 overflow-hidden"
        onMouseEnter={() => product.images.length > 1 && setActiveImageIndex(1)}
        onMouseLeave={() => setActiveImageIndex(0)}
      >
        <img
          src={product.images[activeImageIndex] || product.images[0]}
          alt={getName()}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold tracking-tight shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-xs shadow-xs z-10 ${
            isWishlisted
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={t.wishlist}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View overlay on hover */}
        <div className="absolute inset-x-0 bottom-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center z-10 pointer-events-none">
          <span className="px-3 py-1.5 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            <span>Tezkor ko'rish</span>
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Rating & reviews */}
          <div className="flex items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({product.reviewsCount})</span>
            </div>

            {/* Low stock warning */}
            {product.stock <= 3 && product.stock > 0 ? (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                {product.stock} {t.leftInStock}
              </span>
            ) : product.stock === 0 ? (
              <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                {t.outOfStock}
              </span>
            ) : null}
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
            {getName()}
          </h3>
        </div>

        {/* Price & Action footer */}
        <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-stone-400 text-[11px] line-through font-medium">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
                  {formatCurrency(product.discountPrice)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 ${
              product.stock === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-300 shadow-xs active:scale-95'
            }`}
            title={t.addToCart}
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
