import React, { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  Product,
  Category,
  Order,
  Customer,
  PromoCode,
  StoreSettings,
  StaffMember,
  CartItem,
  Language,
  OrderStatus,
} from './types';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  setStoredProducts,
  getCategories,
  saveCategory,
  deleteCategory,
  setStoredCategories,
  getOrders,
  createOrder,
  updateOrderStatus,
  setStoredOrders,
  getCustomers,
  setStoredCustomers,
  getPromoCodes,
  setStoredPromoCodes,
  getSettings,
  saveSettings,
  setStoredSettings,
  getStaff,
  saveStaff,
  setStoredStaff,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist,
  getLanguage,
  saveLanguage,
  formatCurrency,
  getSavedViewMode,
  saveViewMode,
  getSavedCategory,
  saveCategorySelection,
  getSavedProductId,
  saveProductId,
  getSavedActiveModal,
  saveActiveModal,
} from './services/storage';
import {
  testConnection,
  signInWithGoogle,
  signOutFromFirebase,
  onAuthStatusChange,
  isUserAdmin,
  subscribeToCollection,
  syncCollectionToFirestore,
} from './services/firebase';
import {
  initialProducts,
  initialCategories,
  initialOrders,
  initialCustomers,
  initialPromoCodes,
  initialSettings,
  initialStaff,
} from './data/seedData';

// Storefront components
import { StoreHeader } from './components/storefront/StoreHeader';
import { HeroBanner } from './components/storefront/HeroBanner';
import { CategoryBar } from './components/storefront/CategoryBar';
import { ProductCatalog } from './components/storefront/ProductCatalog';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { UserCabinetModal } from './components/storefront/UserCabinetModal';
import { StoreFooter } from './components/storefront/StoreFooter';

// Admin panel components
import { AdminLayout } from './components/admin/AdminLayout';

export default function App() {
  // Mode switcher: 'storefront' | 'admin' (persisted across reloads)
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>(() => getSavedViewMode());

  const handleSwitchViewMode = (mode: 'storefront' | 'admin') => {
    setViewMode(mode);
    saveViewMode(mode);
  };

  // Firebase Auth and Connection State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  // Core Data States (initialized from local storage cache)
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());
  const [promos, setPromos] = useState<PromoCode[]>(getPromoCodes());
  const [settings, setSettings] = useState<StoreSettings>(getSettings());
  const [staff, setStaff] = useState<StaffMember[]>(getStaff());

  // User State
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [wishlist, setWishlist] = useState<string[]>(getWishlist());

  // Storefront UI State (persisted across reloads)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => getSavedCategory());
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(() => {
    const savedPid = getSavedProductId();
    if (!savedPid) return null;
    const initialProds = getProducts();
    return initialProds.find((p) => p.id === savedPid) || null;
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(
    () => getSavedActiveModal() === 'cart'
  );
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(
    () => getSavedActiveModal() === 'checkout'
  );
  const [isCabinetModalOpen, setIsCabinetModalOpen] = useState<boolean>(
    () => getSavedActiveModal() === 'cabinet'
  );

  const handleSelectCategory = (id: string | null) => {
    const catId = id || 'all';
    setSelectedCategoryId(catId);
    saveCategorySelection(catId);
  };

  const handleSelectProduct = (p: Product | null) => {
    setSelectedProductForDetail(p);
    saveProductId(p ? p.id : null);
  };

  const handleOpenCart = () => {
    setIsCartDrawerOpen(true);
    saveActiveModal('cart');
  };

  const handleCloseCart = () => {
    setIsCartDrawerOpen(false);
    saveActiveModal(null);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutModalOpen(true);
    saveActiveModal('checkout');
  };

  const handleCloseCheckout = () => {
    setIsCheckoutModalOpen(false);
    saveActiveModal(null);
  };

  const handleOpenCabinet = () => {
    setIsCabinetModalOpen(true);
    saveActiveModal('cabinet');
  };

  const handleCloseCabinet = () => {
    setIsCabinetModalOpen(false);
    saveActiveModal(null);
  };

  // Promo state for cart
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Firebase Real-Time Firestore & Auth Subscriptions
  useEffect(() => {
    // 1. Connection check
    testConnection().then((connected) => {
      setFirebaseConnected(connected);
    });

    // 2. Auth listener
    const unsubAuth = onAuthStatusChange((user) => {
      setCurrentUser(user);
      setIsAdminUser(isUserAdmin(user));
    });

    // 3. Public Firestore Live Data Subscriptions (Products, Categories, Promos)
    const unsubProducts = subscribeToCollection<Product>(
      'products',
      (data) => {
        if (data && data.length > 0) {
          setProducts(data);
          setStoredProducts(data);
        }
        setFirebaseConnected(true);
      },
      () => setFirebaseConnected(false)
    );

    const unsubCategories = subscribeToCollection<Category>(
      'categories',
      (data) => {
        if (data && data.length > 0) {
          setCategories(data);
          setStoredCategories(data);
        }
      }
    );

    const unsubPromos = subscribeToCollection<PromoCode>('promos', (data) => {
      if (data && data.length > 0) {
        setPromos(data);
        setStoredPromoCodes(data);
      }
    });

    return () => {
      unsubAuth();
      unsubProducts();
      unsubCategories();
      unsubPromos();
    };
  }, []);

  // Admin-only subscriptions (orders, customers) and data seeding
  useEffect(() => {
    if (!isAdminUser) return;

    // Subscriptions for privileged collections
    const unsubOrders = subscribeToCollection<Order>('orders', (data) => {
      if (data && data.length > 0) {
        setOrders(data);
        setStoredOrders(data);
      } else {
        syncCollectionToFirestore('orders', initialOrders).catch(() => {});
      }
    });

    const unsubCustomers = subscribeToCollection<Customer>('customers', (data) => {
      if (data && data.length > 0) {
        setCustomers(data);
        setStoredCustomers(data);
      } else {
        syncCollectionToFirestore('customers', initialCustomers).catch(() => {});
      }
    });

    // If cloud products, categories, or promos are empty, authenticated admin seeds them
    syncCollectionToFirestore('products', initialProducts).catch(() => {});
    syncCollectionToFirestore('categories', initialCategories).catch(() => {});
    syncCollectionToFirestore('promos', initialPromoCodes).catch(() => {});

    return () => {
      unsubOrders();
      unsubCustomers();
    };
  }, [isAdminUser]);

  // Re-sync selected product modal if products change or arrive from Firestore
  useEffect(() => {
    const savedPid = getSavedProductId();
    if (savedPid && !selectedProductForDetail && products.length > 0) {
      const found = products.find((p) => p.id === savedPid);
      if (found) {
        setSelectedProductForDetail(found);
      }
    }
  }, [products]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setViewMode(getSavedViewMode());
      setSelectedCategoryId(getSavedCategory());
      const pid = getSavedProductId();
      if (pid) {
        const found = products.find((p) => p.id === pid);
        setSelectedProductForDetail(found || null);
      } else {
        setSelectedProductForDetail(null);
      }
      const activeModal = getSavedActiveModal();
      setIsCartDrawerOpen(activeModal === 'cart');
      setIsCheckoutModalOpen(activeModal === 'checkout');
      setIsCabinetModalOpen(activeModal === 'cabinet');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Language Change
  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    saveLanguage(lang);
  };

  // Google Authentication Handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFromFirebase();
    } catch (error) {
      console.error('Sign-Out failed:', error);
    }
  };

  // Add To Cart
  const handleAddToCart = (
    product: Product,
    selectedSize?: string,
    selectedColor?: { name: string; hex: string },
    quantity = 1
  ) => {
    const size = selectedSize || (product.sizes.length > 0 ? product.sizes[0] : undefined);
    const color = selectedColor || (product.colors.length > 0 ? product.colors[0] : undefined);
    const itemId = `${product.id}-${size || 'default'}-${color?.name || 'default'}`;

    const existingIndex = cart.findIndex((i) => i.id === itemId);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: itemId,
        product,
        quantity,
        selectedSize: size,
        selectedColor: color,
      };
      updatedCart = [newItem, ...cart];
    }

    setCart(updatedCart);
    saveCart(updatedCart);
  };

  // Buy Now (Adds to cart and opens checkout directly)
  const handleBuyNow = (
    product: Product,
    selectedSize?: string,
    selectedColor?: { name: string; hex: string },
    quantity = 1
  ) => {
    handleAddToCart(product, selectedSize, selectedColor, quantity);
    setIsCheckoutModalOpen(true);
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    const updated = cart.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i));
    setCart(updated);
    saveCart(updated);
  };

  // Remove Cart Item
  const handleRemoveCartItem = (itemId: string) => {
    const updated = cart.filter((i) => i.id !== itemId);
    setCart(updated);
    saveCart(updated);
  };

  // Toggle Wishlist
  const handleToggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    saveWishlist(updated);
  };

  // Order Success Handler
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    // Clear cart
    setCart([]);
    saveCart([]);
    setAppliedPromo('');
    setPromoDiscount(0);
  };

  // Admin Data Handlers
  const handleSaveProduct = (prod: Product) => {
    saveProduct(prod);
    setProducts(getProducts());
  };

  const handleDeleteProduct = (prodId: string) => {
    deleteProduct(prodId);
    setProducts(getProducts());
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    setOrders(getOrders());
  };

  const handleUpdatePaymentStatus = (orderId: string, paymentStatus: 'paid' | 'pending') => {
    const existing = orders.find((o) => o.id === orderId);
    if (existing) {
      createOrder({ ...existing, paymentStatus });
      setOrders(getOrders());
    }
  };

  const handleSaveCategory = (cat: Category) => {
    saveCategory(cat);
    setCategories(getCategories());
  };

  const handleDeleteCategory = (catId: string) => {
    deleteCategory(catId);
    setCategories(getCategories());
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSaveStaff = (newStaff: StaffMember[]) => {
    saveStaff(newStaff);
    setStaff(newStaff);
  };

  const handleRefreshPromos = () => {
    setPromos(getPromoCodes());
  };

  // Derived wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // If Admin Mode is active
  if (viewMode === 'admin') {
    return (
      <AdminLayout
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onSwitchToStorefront={() => handleSwitchViewMode('storefront')}
        products={products}
        categories={categories}
        orders={orders}
        customers={customers}
        promos={promos}
        settings={settings}
        staff={staff}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onSaveSettings={handleSaveSettings}
        onSaveStaff={handleSaveStaff}
        onRefreshPromos={handleRefreshPromos}
        currentUser={currentUser}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isAdmin={isAdminUser}
        firebaseConnected={firebaseConnected}
      />
    );
  }

  // Customer Storefront Mode
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans antialiased flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950">
      {/* Header */}
      <StoreHeader
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
        cartTotal={cart.reduce(
          (acc, i) => acc + (i.product.discountPrice || i.product.price) * i.quantity,
          0
        )}
        wishlistCount={wishlist.length}
        onOpenCart={handleOpenCart}
        onOpenWishlist={handleOpenCabinet}
        onOpenCabinet={handleOpenCabinet}
        onSwitchToAdmin={() => handleSwitchViewMode('admin')}
        products={products}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategoryId === 'all' ? null : selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        onSelectProduct={handleSelectProduct}
        currentUser={currentUser}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isAdmin={isAdminUser}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-8">
        {/* Promotional Hero Banner */}
        <HeroBanner
          currentLang={currentLang}
          onExploreClick={() => {
            handleSelectCategory('all');
            const el = document.getElementById('catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onCategorySelect={(catId: string) => {
            handleSelectCategory(catId);
            const el = document.getElementById('catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Category Navigation Bar */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId === 'all' ? null : selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          currentLang={currentLang}
        />

        {/* Product Catalog with Filtering & Sorting */}
        <div id="catalog-section">
          <ProductCatalog
            products={products}
            categories={categories}
            selectedCategoryId={selectedCategoryId === 'all' ? null : selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentLang={currentLang}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={(prod) => handleAddToCart(prod)}
            onSelectProduct={handleSelectProduct}
          />
        </div>
      </main>

      {/* Storefront Footer */}
      <StoreFooter
        currentLang={currentLang}
        settings={settings}
        onSwitchToAdmin={() => handleSwitchViewMode('admin')}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => handleSelectProduct(null)}
        currentLang={currentLang}
        isWishlisted={
          selectedProductForDetail ? wishlist.includes(selectedProductForDetail.id) : false
        }
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        allProducts={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={handleCloseCart}
        cart={cart}
        currentLang={currentLang}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        appliedPromo={appliedPromo}
        promoDiscount={promoDiscount}
        onApplyPromo={(code, discount) => {
          setAppliedPromo(code);
          setPromoDiscount(discount);
        }}
        onOpenCheckout={handleOpenCheckout}
        onStartShopping={() => {
          handleCloseCart();
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseCheckout}
        cart={cart}
        currentLang={currentLang}
        settings={settings}
        appliedPromo={appliedPromo}
        promoDiscount={promoDiscount}
        onOrderSuccess={handleOrderSuccess}
        onOpenCabinet={handleOpenCabinet}
      />

      {/* User Cabinet & Orders Modal */}
      <UserCabinetModal
        isOpen={isCabinetModalOpen}
        onClose={handleCloseCabinet}
        orders={orders}
        wishlistProducts={wishlistProducts}
        currentLang={currentLang}
        onSelectProduct={(p) => {
          handleCloseCabinet();
          handleSelectProduct(p);
        }}
        onAddToCart={(p) => handleAddToCart(p)}
        onRemoveFromWishlist={handleToggleWishlist}
        currentUser={currentUser}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
