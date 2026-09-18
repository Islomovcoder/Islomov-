import React, { useState } from 'react';
import { Plus, Trash2, Edit2, FolderTree, Image as ImageIcon } from 'lucide-react';
import { Category, Language } from '../../types';
import { translations } from '../../data/translations';

interface AdminCategoriesProps {
  categories: Category[];
  currentLang: Language;
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  currentLang,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const t = translations[currentLang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form states
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [icon, setIcon] = useState('Shirt');

  const openCreateModal = () => {
    setEditingCat(null);
    setNameUz('');
    setNameRu('');
    setNameEn('');
    setImageUrl('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80');
    setIcon('Tag');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setNameUz(cat.nameUz);
    setNameRu(cat.nameRu);
    setNameEn(cat.nameEn);
    setImageUrl(cat.image);
    setIcon(cat.iconName || 'Tag');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz.trim()) return;

    const saved: Category = {
      id: editingCat ? editingCat.id : `cat-${Date.now()}`,
      nameUz: nameUz.trim(),
      nameRu: nameRu.trim() || nameUz.trim(),
      nameEn: nameEn.trim() || nameUz.trim(),
      slug: nameUz.toLowerCase().replace(/\s+/g, '-'),
      iconName: icon || 'Tag',
      image: imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      subcategories: editingCat?.subcategories || [],
    };

    onSaveCategory(saved);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {t.navCategories}
          </h1>
          <p className="text-xs text-stone-400">Do'kon bo'limlari va katalog ierarxiyasi</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi kategoriya</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-start gap-3">
              <img
                src={cat.image}
                alt={cat.nameUz}
                className="w-14 h-14 rounded-xl object-cover border border-stone-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-stone-100 text-sm truncate">{cat.nameUz}</h3>
                <p className="text-[11px] text-stone-400">RU: {cat.nameRu}</p>
                <p className="text-[11px] text-stone-400">EN: {cat.nameEn}</p>
              </div>
            </div>

            {/* Subcategories preview */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-800/80">
                {cat.subcategories.map((sub) => (
                  <span
                    key={sub.id}
                    className="px-2 py-0.5 rounded-md bg-stone-800 text-[10px] text-stone-300 font-medium"
                  >
                    {sub.nameUz}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => openEditModal(cat)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition text-xs flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${cat.nameUz}" kategoriyasini o'chirishni tasdiqlaysizmi?`)) {
                    onDeleteCategory(cat.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 text-stone-400 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 text-stone-200 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {editingCat ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya yaratish'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Nomi (O'zbekcha) *</label>
                <input
                  type="text"
                  required
                  value={nameUz}
                  onChange={(e) => setNameUz(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nomi (Ruscha)</label>
                <input
                  type="text"
                  value={nameRu}
                  onChange={(e) => setNameRu(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nomi (Inglizcha)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Rasm URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
