import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Settings,
  Store,
  Camera,
  Bell,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronRight,
  Database,
  ShieldCheck,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  Product,
  Category,
  Order,
  Customer,
  PromoCode,
  StoreSettings,
  StaffMember,
  Language,
  OrderStatus,
} from '../../types';
import { translations } from '../../data/translations';
import { getSavedAdminTab, saveAdminTab } from '../../services/storage';
import { AdminDashboard } from './AdminDashboard';
import { AdminProductsList } from './AdminProductsList';
import { AdminProductModal } from './AdminProductModal';
import { AdminOrdersList } from './AdminOrdersList';
import { AdminCategories } from './AdminCategories';
import { AdminCustomers } from './AdminCustomers';
import { AdminPromos } from './AdminPromos';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';

interface AdminLayoutProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onSwitchToStorefront: () => void;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  promos: PromoCode[];
  settings: StoreSettings;
  staff: StaffMember[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePaymentStatus: (orderId: string, status: 'paid' | 'pending') => void;
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onSaveStaff: (staff: StaffMember[]) => void;
  onRefreshPromos: () => void;
  currentUser?: FirebaseUser | null;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
  isAdmin?: boolean;
  firebaseConnected?: boolean;
}

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'promos'
  | 'reports'
  | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentLang,
  onLanguageChange,
  onSwitchToStorefront,
  products,
  categories,
  orders,
  customers,
  promos,
  settings,
  staff,
  onSaveProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onSaveCategory,
  onDeleteCategory,
  onSaveSettings,
  onSaveStaff,
  onRefreshPromos,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  isAdmin,
  firebaseConnected = true,
}) => {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const saved = getSavedAdminTab();
    const validTabs: AdminTab[] = [
      'dashboard',
      'products',
      'categories',
      'orders',
      'customers',
      'promos',
      'reports',
      'settings',
    ];
    if (validTabs.includes(saved as AdminTab)) {
      return saved as AdminTab;
    }
    return 'dashboard';
  });

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    saveAdminTab(tab);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const pendingOrdersCount = orders.filter((o) => o.status === 'new').length;

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductModalOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'products', label: t.navProducts, icon: Package, count: products.length },
    { id: 'categories', label: t.navCategories, icon: FolderTree },
    { id: 'orders', label: t.navOrders, icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'customers', label: t.navCustomers, icon: Users },
    { id: 'promos', label: t.navDiscounts, icon: Tag },
    { id: 'reports', label: t.navReports, icon: BarChart3 },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Mobile menu toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm">
                S
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-stone-100 text-sm tracking-tight block">
                  Savdo<span className="text-amber-500">Hub</span>
                </span>
                <span className="text-[10px] text-stone-400 font-medium">Boshqaruv Paneli</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Camera button */}
            <button
              onClick={handleOpenNewProduct}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.quickCameraAdd}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800 border border-stone-700 rounded-xl p-0.5 text-xs font-bold">
              {(['uz', 'ru', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2 py-1 rounded-lg uppercase text-[10px] transition ${
                    currentLang === lang
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Firestore Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700/80 text-[11px] font-medium text-stone-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  firebaseConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
                }`}
              />
              <Database className="w-3 h-3 text-stone-400" />
              <span>{firebaseConnected ? 'Firestore Faol' : 'Lokal rejim'}</span>
            </div>

            {/* Switch to Storefront */}
            <button
              onClick={onSwitchToStorefront}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.switchStorefront}</span>
            </button>

            {/* Admin Avatar & Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Admin'}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-amber-400">
                    {(currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="hidden lg:flex p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
                    title="Chiqish"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onSignInWithGoogle && (
                <button
                  onClick={onSignInWithGoogle}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google Kirish</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-[57px] left-0 z-30 w-64 h-[calc(100vh-57px)] bg-stone-900 border-r border-stone-800 p-4 flex flex-col justify-between transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id as AdminTab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Bottom user profile & Storefront button */}
          <div className="pt-4 border-t border-stone-800 space-y-2">
            <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs">
              <p className="font-bold text-stone-200 truncate">
                {currentUser?.displayName || 'Rustam Aliyev'}
              </p>
              <p className="text-[11px] text-amber-400 font-mono truncate">
                {currentUser?.email || 'Bosh Administrator'}
              </p>
            </div>
            <button
              onClick={onSwitchToStorefront}
              className="w-full py-2 rounded-xl text-xs text-stone-400 hover:text-white flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Do'konga qaytish</span>
            </button>
          </div>
        </aside>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              products={products}
              orders={orders}
              customers={customers}
              currentLang={currentLang}
              onOpenNewProduct={handleOpenNewProduct}
              onOpenOrders={() => handleTabChange('orders')}
              onEditProduct={handleEditProduct}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsList
              products={products}
              categories={categories}
              currentLang={currentLang}
              onOpenNewProduct={handleOpenNewProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={onDeleteProduct}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              currentLang={currentLang}
              onSaveCategory={onSaveCategory}
              onDeleteCategory={onDeleteCategory}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersList
              orders={orders}
              currentLang={currentLang}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onUpdatePaymentStatus={onUpdatePaymentStatus}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers customers={customers} currentLang={currentLang} />
          )}

          {activeTab === 'promos' && (
            <AdminPromos
              promos={promos}
              currentLang={currentLang}
              onRefresh={onRefreshPromos}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReports
              products={products}
              orders={orders}
              categories={categories}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              settings={settings}
              staff={staff}
              currentLang={currentLang}
              onSaveSettings={onSaveSettings}
              onSaveStaff={onSaveStaff}
            />
          )}
        </main>
      </div>

      {/* Product Add / Edit Modal */}
      <AdminProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={editingProduct}
        categories={categories}
        currentLang={currentLang}
        onSave={onSaveProduct}
      />
    </div>
  );
};
