import React from 'react';
import { Smartphone, Shirt, Sparkles, Home, Activity, Grid } from 'lucide-react';
import { Category, Language } from '../../types';
import { translations } from '../../data/translations';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  currentLang: Language;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  currentLang,
}) => {
  const t = translations[currentLang];

  const getCatName = (cat: Category) => {
    if (currentLang === 'ru') return cat.nameRu;
    if (currentLang === 'en') return cat.nameEn;
    return cat.nameUz;
  };

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Shirt':
        return <Shirt className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Home':
        return <Home className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      default:
        return <Grid className={className} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {/* All Categories Pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition border ${
            selectedCategoryId === null
              ? 'bg-stone-900 border-stone-900 text-white shadow-md'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
          }`}
        >
          <Grid className="w-4 h-4 text-amber-400" />
          <span>{t.allCategories}</span>
        </button>

        {/* Category Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition border ${
                isSelected
                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              <span className={isSelected ? 'text-stone-950' : 'text-stone-500'}>
                {renderIcon(cat.iconName, 'w-4 h-4')}
              </span>
              <span>{getCatName(cat)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
