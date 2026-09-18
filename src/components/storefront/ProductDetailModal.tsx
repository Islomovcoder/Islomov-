import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Zap,
  MessageSquare,
  Plus,
  Minus,
} from 'lucide-react';
import { Product, Language, ProductReview } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency, saveProduct } from '../../services/storage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  currentLang: Language;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (
    product: Product,
    selectedSize?: string,
    selectedColor?: { name: string; hex: string },
    quantity?: number
  ) => void;
  onBuyNow: (
    product: Product,
    selectedSize?: string,
    selectedColor?: { name: string; hex: string },
    quantity?: number
  ) => void;
  allProducts: Product[];
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  currentLang,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  allProducts,
  onSelectProduct,
}) => {
  if (!product) return null;

  const t = translations[currentLang];
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | undefined>(
    product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  // Review form states
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const getName = (p: Product) => {
    if (currentLang === 'ru') return p.nameRu;
    if (currentLang === 'en') return p.nameEn;
    return p.nameUz;
  };

  const getDesc = (p: Product) => {
    if (currentLang === 'ru') return p.descriptionRu;
    if (currentLang === 'en') return p.descriptionEn;
    return p.descriptionUz;
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize || undefined, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    onBuyNow(product, selectedSize || undefined, selectedColor, quantity);
    onClose();
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewerName.trim(),
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: reviewComment.trim(),
      verifiedPurchase: true,
    };

    const updatedReviews = [newReview, ...(product.reviews || [])];
    const avgRating =
      updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) / updatedReviews.length;

    const updatedProduct: Product = {
      ...product,
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: Number(avgRating.toFixed(1)),
    };

    saveProduct(updatedProduct);
    setReviewSubmitted(true);
    setReviewerName('');
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body: Scrollable */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Left: Image Gallery */}
            <div className="space-y-3">
              {/* Big active image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                <img
                  src={product.images[selectedImgIndex] || product.images[0]}
                  alt={getName(product)}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-bold tracking-tight shadow-md">
                    -{discountPercent}%
                  </span>
                )}
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition ${
                    isWishlisted
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/90 text-stone-700 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnails row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        selectedImgIndex === idx
                          ? 'border-amber-500 shadow-md'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Meta & Purchase Controls */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-mono uppercase bg-stone-100 px-2 py-0.5 rounded">
                    SKU: {product.sku}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-stone-400 font-normal">
                      ({product.reviewsCount} {t.reviews})
                    </span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                  {getName(product)}
                </h1>

                {/* Stock status badge */}
                <div>
                  {product.stock > 5 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {t.inStock} ({product.stock} dona)
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {product.stock} {t.leftInStock}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                      {t.outOfStock}
                    </span>
                  )}
                </div>
              </div>

              {/* Price section */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 font-medium">Narx</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900">
                      {formatCurrency(product.discountPrice || product.price)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm text-stone-400 line-through font-medium">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </div>
                {discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs">
                    Tejamkorlik: {discountPercent}%
                  </span>
                )}
              </div>

              {/* Sizes Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {t.selectSize}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                          selectedSize === size
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {t.selectColor}:{' '}
                    <span className="text-stone-900 font-semibold">
                      {selectedColor?.name || ''}
                    </span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          selectedColor?.name === c.name
                            ? 'scale-125 ring-2 ring-stone-900 ring-offset-2'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-white transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-white transition disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-stone-500">
                  Jami: <strong>{formatCurrency((product.discountPrice || product.price) * quantity)}</strong>
                </span>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`py-3.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs ${
                    product.stock === 0
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-amber-400 active:scale-98'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.addedToCartSuccess}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t.addToCart}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 transition flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/25 active:scale-98 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t.buyNow}</span>
                </button>
              </div>

              {/* Trust badges row */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-stone-600 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Tezkor yetkazish</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>100% asl sifat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description vs Customer Reviews */}
          <div className="pt-6 border-t border-stone-200">
            <div className="flex gap-4 border-b border-stone-200 pb-2">
              <button
                onClick={() => setActiveTab('desc')}
                className={`text-sm font-bold pb-2 border-b-2 transition ${
                  activeTab === 'desc'
                    ? 'border-amber-500 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.description}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-sm font-bold pb-2 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-amber-500 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>{t.reviewsTab}</span>
                <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full text-stone-600">
                  {product.reviewsCount}
                </span>
              </button>
            </div>

            {activeTab === 'desc' ? (
              <div className="py-4 text-sm text-stone-700 leading-relaxed space-y-3">
                <p>{getDesc(product)}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <p className="text-stone-400">Artikul (SKU)</p>
                    <p className="font-bold text-stone-800">{product.sku}</p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <p className="text-stone-400">Kategoriya</p>
                    <p className="font-bold text-stone-800">{product.categoryId.replace('cat-', '')}</p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <p className="text-stone-400">Mavjudlik</p>
                    <p className="font-bold text-emerald-600">{product.stock} dona omborda</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-6">
                {/* Reviews List */}
                <div className="space-y-3">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{rev.author}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                                Tasdiqlangan xaridor
                              </span>
                            )}
                          </div>
                          <span className="text-stone-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-500 italic">
                      Hozircha sharhlar yo'q. Birinchi bo'lib fikr bildiring!
                    </p>
                  )}
                </div>

                {/* Add Review Form */}
                <form
                  onSubmit={handleAddReview}
                  className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.addReview}</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder={t.yourName}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-stone-700">Bahoyingiz:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= reviewRating ? 'fill-amber-400' : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    required
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t.yourComment}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-hidden focus:border-amber-500"
                  />

                  <div className="flex justify-between items-center">
                    {reviewSubmitted && (
                      <span className="text-xs text-emerald-600 font-semibold">
                        Sharhingiz uchun rahmat!
                      </span>
                    )}
                    <button
                      type="submit"
                      className="ml-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold rounded-xl transition"
                    >
                      {t.sendReview}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Related Products row */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-stone-200 space-y-3">
              <h3 className="text-sm font-bold text-stone-900">{t.relatedProducts}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="group cursor-pointer p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 transition bg-white space-y-1.5"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-stone-100">
                      <img
                        src={rel.images[0]}
                        alt={getName(rel)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">
                      {getName(rel)}
                    </p>
                    <p className="text-[11px] font-extrabold text-amber-600">
                      {formatCurrency(rel.discountPrice || rel.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
