import React, { useState } from 'react';
import {
  Search,
  Plus,
  Camera,
  Edit2,
  Trash2,
  Filter,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { Product, Category, Language } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';

interface AdminProductsListProps {
  products: Product[];
  categories: Category[];
  currentLang: Language;
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const AdminProductsList: React.FC<AdminProductsListProps> = ({
  products,
  categories,
  currentLang,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nameUz.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesStock = filterLowStock ? p.stock <= 4 : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-5">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {t.navProducts}
          </h1>
          <p className="text-xs text-stone-400">
            Jami: {products.length} ta tovar ro'yxatda mavjud
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewProduct}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>{t.addNewProduct} / Kamera</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nomi yoki SKU bo'yicha qidirish..."
            className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder:text-stone-500 outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-200 outline-hidden focus:border-amber-500"
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameUz}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle */}
          <button
            type="button"
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              filterLowStock
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Kam qolganlar (≤ 4)</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/40 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Mahsulot</th>
                <th className="py-3 px-4">Kategoriya</th>
                <th className="py-3 px-4">Narx</th>
                <th className="py-3 px-4">Omborda</th>
                <th className="py-3 px-4">Reyting</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= 4;
                const isOutOfStock = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-stone-800/40 transition group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-11 h-11 object-cover rounded-xl border border-stone-700 bg-stone-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-200 truncate max-w-xs">{p.nameUz}</p>
                          <p className="text-[11px] font-mono text-stone-500">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-stone-300">
                      <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 font-medium">
                        {p.categoryId.replace('cat-', '')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-100">
                        {formatCurrency(p.discountPrice || p.price)}
                      </div>
                      {p.discountPrice && (
                        <div className="text-[10px] text-stone-500 line-through">
                          {formatCurrency(p.price)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                          Tugagan
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                          {p.stock} dona (Kam)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                          {p.stock} dona
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-stone-300">
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <span>★</span>
                        <span>{p.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-stone-500 font-normal">
                          ({p.reviewsCount})
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${p.nameUz}" tovarini o'chirishni xohlaysizmi?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-stone-800 hover:bg-rose-900/60 text-stone-400 hover:text-rose-400 transition"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
