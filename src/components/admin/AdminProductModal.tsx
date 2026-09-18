import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Edit3,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Product, Category, Language } from '../../types';
import { translations } from '../../data/translations';
import { AdminCameraCapture } from './AdminCameraCapture';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  categories: Category[];
  currentLang: Language;
  onSave: (product: Product) => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  currentLang,
  onSave,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>(
    productToEdit ? 'manual' : 'camera'
  );

  // Form states
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionUz, setDescriptionUz] = useState('');
  const [descriptionRu, setDescriptionRu] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(10);
  const [sku, setSku] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setNameUz(productToEdit.nameUz);
      setNameRu(productToEdit.nameRu);
      setNameEn(productToEdit.nameEn);
      setDescriptionUz(productToEdit.descriptionUz);
      setDescriptionRu(productToEdit.descriptionRu);
      setDescriptionEn(productToEdit.descriptionEn);
      setCategoryId(productToEdit.categoryId);
      setSubcategoryId(productToEdit.subcategoryId || '');
      setPrice(productToEdit.price);
      setDiscountPrice(productToEdit.discountPrice);
      setStock(productToEdit.stock);
      setSku(productToEdit.sku);
      setSizesInput(productToEdit.sizes.join(', '));
      setImages(productToEdit.images || []);
    } else {
      // New product defaults
      setNameUz('');
      setNameRu('');
      setNameEn('');
      setDescriptionUz('');
      setDescriptionRu('');
      setDescriptionEn('');
      setCategoryId(categories[0]?.id || '');
      setSubcategoryId('');
      setPrice(250000);
      setDiscountPrice(undefined);
      setStock(15);
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setSizesInput('S, M, L');
      setImages([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ]);
    }
  }, [productToEdit, categories]);

  const handlePhotosCaptured = (captured: string[]) => {
    setImages((prev) => [...captured, ...prev]);
    setActiveTab('manual');
  };

  const handleAiSuggest = (data: {
    nameUz: string;
    nameRu: string;
    nameEn: string;
    category: string;
    price: number;
    description: string;
  }) => {
    setNameUz(data.nameUz);
    setNameRu(data.nameRu);
    setNameEn(data.nameEn);
    setDescriptionUz(data.description);
    setDescriptionRu(data.description);
    setDescriptionEn(data.description);
    setCategoryId(data.category);
    setPrice(data.price);
    setActiveTab('manual');
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz.trim()) return;

    const sizesArr = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const savedProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      nameUz: nameUz.trim(),
      nameRu: nameRu.trim() || nameUz.trim(),
      nameEn: nameEn.trim() || nameUz.trim(),
      descriptionUz: descriptionUz.trim(),
      descriptionRu: descriptionRu.trim() || descriptionUz.trim(),
      descriptionEn: descriptionEn.trim() || descriptionUz.trim(),
      categoryId,
      subcategoryId: subcategoryId || undefined,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock),
      sku: sku.trim() || `SKU-${Date.now()}`,
      sizes: sizesArr.length > 0 ? sizesArr : ['Standart'],
      colors: productToEdit?.colors || [{ name: 'Standart', hex: '#111827' }],
      images:
        images.length > 0
          ? images
          : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      rating: productToEdit?.rating || 5.0,
      reviewsCount: productToEdit?.reviewsCount || 0,
      reviews: productToEdit?.reviews || [],
      isNew: productToEdit ? productToEdit.isNew : true,
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString().split('T')[0],
    };

    onSave(savedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 text-stone-100 rounded-3xl shadow-2xl border border-stone-800 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/40">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {productToEdit ? t.editProduct : t.createNewProduct}
            </h2>
            <p className="text-xs text-stone-400">
              Kamera orqali suratga oling yoki maydonlarni qo'lda to'ldiring
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-800 px-6 pt-3 gap-4 bg-stone-950/20 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'camera'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.cameraTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'manual'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.manualTab}</span>
          </button>
        </div>

        {/* Body content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'camera' ? (
            <AdminCameraCapture
              currentLang={currentLang}
              onPhotosCaptured={handlePhotosCaptured}
              onAiSuggest={handleAiSuggest}
            />
          ) : (
            /* Manual Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Multilingual names */}
              <div className="space-y-3">
                <label className="font-bold text-stone-300 block">Mahsulot nomi (3 tilda)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={nameUz}
                      onChange={(e) => setNameUz(e.target.value)}
                      placeholder="Nomi (O'zbekcha) *"
                      className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={nameRu}
                      onChange={(e) => setNameRu(e.target.value)}
                      placeholder="Nomi (Ruscha)"
                      className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="Nomi (Inglizcha)"
                      className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category, SKU, and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Kategoriya *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameUz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Artikul (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-8942"
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Ombordagi qoldiq (dona) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Prices and Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Asosiy narx (so'm) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Chegirma narxi (so'm)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountPrice || ''}
                    onChange={(e) =>
                      setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Masalan: 199000"
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">O'lchamlar (vergul bilan)</label>
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    placeholder="S, M, L, XL"
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-stone-400 block mb-1">Tavsif (O'zbekcha)</label>
                <textarea
                  rows={3}
                  value={descriptionUz}
                  onChange={(e) => setDescriptionUz(e.target.value)}
                  placeholder="Mahsulot haqida batafsil ma'lumot..."
                  className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Images preview & adding */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="text-stone-400 font-bold">
                    Rasmlar galereyasi ({images.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('camera')}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Kameradan yangi surat qo'shish</span>
                  </button>
                </div>

                {/* Add URL form */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Rasm URL havolasi (https://...)"
                    className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold border border-stone-700"
                  >
                    Qo'shish
                  </button>
                </div>

                {/* Gallery thumbnails with remove buttons */}
                <div className="flex items-center gap-2.5 overflow-x-auto py-2">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-700 shrink-0 group"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-rose-950/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Save Button */}
              <div className="pt-4 border-t border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold hover:bg-stone-700 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.saveProduct}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
