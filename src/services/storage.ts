import {
  Product,
  Category,
  Order,
  PromoCode,
  Customer,
  StoreSettings,
  StaffMember,
  CartItem,
  OrderStatus,
  PaymentStatus,
  Language,
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialPromoCodes,
  initialOrders,
  initialCustomers,
  initialSettings,
  initialStaff,
} from '../data/seedData';
import {
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  auth,
  isUserAdmin,
} from './firebase';

const STORAGE_KEYS = {
  PRODUCTS: 'savdohub_products_v1',
  CATEGORIES: 'savdohub_categories_v1',
  ORDERS: 'savdohub_orders_v1',
  PROMOS: 'savdohub_promos_v1',
  CUSTOMERS: 'savdohub_customers_v1',
  SETTINGS: 'savdohub_settings_v1',
  STAFF: 'savdohub_staff_v1',
  CART: 'savdohub_cart_v1',
  WISHLIST: 'savdohub_wishlist_v1',
  LANGUAGE: 'savdohub_lang_v1',
  VIEW_MODE: 'savdohub_view_mode_v1',
  ADMIN_TAB: 'savdohub_admin_tab_v1',
  CATEGORY: 'savdohub_selected_cat_v1',
  PRODUCT_ID: 'savdohub_selected_product_v1',
  ACTIVE_MODAL: 'savdohub_active_modal_v1',
};

// Helper for localStorage
function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('savdohub_storage_update'));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Products
export function getProducts(): Product[] {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
}
export const getStoredProducts = getProducts;

export function setStoredProducts(products: Product[]): void {
  setItem(STORAGE_KEYS.PRODUCTS, products);
}

export function saveProduct(product: Product): void {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  setItem(STORAGE_KEYS.PRODUCTS, products);
  saveDocumentToFirestore('products', product.id, product).catch((e) =>
    console.warn('Firestore product sync warning:', e)
  );
}

export function deleteProduct(productId: string): void {
  const products = getProducts().filter((p) => p.id !== productId);
  setItem(STORAGE_KEYS.PRODUCTS, products);
  deleteDocumentFromFirestore('products', productId).catch((e) =>
    console.warn('Firestore product delete warning:', e)
  );
}

// Categories
export function getCategories(): Category[] {
  return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
}
export const getStoredCategories = getCategories;

export function setStoredCategories(categories: Category[]): void {
  setItem(STORAGE_KEYS.CATEGORIES, categories);
}

export function saveCategory(category: Category): void {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  setItem(STORAGE_KEYS.CATEGORIES, categories);
  saveDocumentToFirestore('categories', category.id, category).catch((e) =>
    console.warn('Firestore category sync warning:', e)
  );
}

export function deleteCategory(categoryId: string): void {
  const categories = getCategories().filter((c) => c.id !== categoryId);
  setItem(STORAGE_KEYS.CATEGORIES, categories);
  deleteDocumentFromFirestore('categories', categoryId).catch((e) =>
    console.warn('Firestore category delete warning:', e)
  );
}

// Orders
export function getOrders(): Order[] {
  return getItem<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
}
export const getStoredOrders = getOrders;

export function setStoredOrders(orders: Order[]): void {
  setItem(STORAGE_KEYS.ORDERS, orders);
}

export function createOrder(order: Order): void {
  const orders = getOrders();
  const existingIdx = orders.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    orders[existingIdx] = order;
  } else {
    orders.unshift(order);
  }
  setItem(STORAGE_KEYS.ORDERS, orders);

  // Firestore sync for order
  saveDocumentToFirestore('orders', order.id, order).catch((e) =>
    console.warn('Firestore order sync warning:', e)
  );

  // Deduct stock for items
  const products = getProducts();
  order.items.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      if (isUserAdmin(auth.currentUser)) {
        saveDocumentToFirestore('products', prod.id, prod).catch(() => {});
      }
    }
  });
  setItem(STORAGE_KEYS.PRODUCTS, products);

  // Record customer stats
  const customers = getCustomers();
  const existingCust = customers.find(
    (c) =>
      c.phone === order.customerPhone || (order.customerEmail && c.email === order.customerEmail)
  );
  if (existingCust) {
    existingCust.totalSpent += order.total;
    const currentOrders = (existingCust.totalOrders || existingCust.ordersCount || 0) + 1;
    existingCust.totalOrders = currentOrders;
    existingCust.ordersCount = currentOrders;
    if (currentOrders >= 3 || existingCust.totalSpent > 2000000) {
      existingCust.segment = 'VIP';
    } else {
      existingCust.segment = 'Regular';
    }
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
    if (isUserAdmin(auth.currentUser)) {
      saveDocumentToFirestore('customers', existingCust.id, existingCust).catch(() => {});
    }
  } else {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail || '',
      totalSpent: order.total,
      totalOrders: 1,
      segment: order.total > 2000000 ? 'VIP' : 'New',
      createdAt: new Date().toISOString().split('T')[0],
      addresses: [
        `${order.shippingAddress.city}, ${order.shippingAddress.street} ${order.shippingAddress.apartment || ''}`,
      ],
    };
    customers.unshift(newCust);
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
    if (isUserAdmin(auth.currentUser)) {
      saveDocumentToFirestore('customers', newCust.id, newCust).catch(() => {});
    }
  }
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.ORDERS, orders);
    saveDocumentToFirestore('orders', order.id, order).catch(() => {});
  }
}

export function updateOrderPayment(orderId: string, paymentStatus: PaymentStatus): void {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.ORDERS, orders);
    saveDocumentToFirestore('orders', order.id, order).catch(() => {});
  }
}

// Promo codes
export function getPromoCodes(): PromoCode[] {
  return getItem<PromoCode[]>(STORAGE_KEYS.PROMOS, initialPromoCodes);
}
export const getStoredPromoCodes = getPromoCodes;

export function setStoredPromoCodes(promos: PromoCode[]): void {
  setItem(STORAGE_KEYS.PROMOS, promos);
}

export function savePromoCode(promo: PromoCode): void {
  const promos = getPromoCodes();
  const index = promos.findIndex((p) => p.code.toUpperCase() === promo.code.toUpperCase());
  if (index >= 0) {
    promos[index] = promo;
  } else {
    promos.unshift(promo);
  }
  setItem(STORAGE_KEYS.PROMOS, promos);
  saveDocumentToFirestore('promos', promo.id, promo).catch(() => {});
}

export function deletePromoCode(id: string): void {
  const promos = getPromoCodes().filter((p) => p.id !== id);
  setItem(STORAGE_KEYS.PROMOS, promos);
  deleteDocumentFromFirestore('promos', id).catch(() => {});
}

export function validatePromo(
  code: string,
  subtotal: number
): { valid: boolean; discount: number; message?: string } {
  const promos = getPromoCodes();
  const matched = promos.find(
    (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.isActive
  );
  if (!matched) {
    return { valid: false, discount: 0, message: "Bunday promo-kod topilmadi yoki muddati o'tgan" };
  }
  if (subtotal < matched.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimal buyurtma summasi ${matched.minOrderAmount.toLocaleString()} so'm`,
    };
  }

  let discount = 0;
  if (matched.discountType === 'percent') {
    discount = Math.round((subtotal * matched.discountValue) / 100);
  } else {
    discount = matched.discountValue;
  }

  return { valid: true, discount: Math.min(discount, subtotal) };
}

// Customers
export function getCustomers(): Customer[] {
  return getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
}
export const getStoredCustomers = getCustomers;

export function setStoredCustomers(customers: Customer[]): void {
  setItem(STORAGE_KEYS.CUSTOMERS, customers);
}

// Settings
export function getSettings(): StoreSettings {
  return getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
}
export const getStoredSettings = getSettings;

export function setStoredSettings(settings: StoreSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

export function saveSettings(settings: StoreSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
  saveDocumentToFirestore('settings', 'store_config', settings).catch(() => {});
}

// Staff
export function getStaff(): StaffMember[] {
  return getItem<StaffMember[]>(STORAGE_KEYS.STAFF, initialStaff);
}

export function setStoredStaff(staff: StaffMember[]): void {
  setItem(STORAGE_KEYS.STAFF, staff);
}

export function saveStaff(staff: StaffMember[]): void {
  setItem(STORAGE_KEYS.STAFF, staff);
  staff.forEach((s) => {
    saveDocumentToFirestore('staff', s.id, s).catch(() => {});
  });
}

// Cart
export function getCart(): CartItem[] {
  return getItem<CartItem[]>(STORAGE_KEYS.CART, []);
}
export const getStoredCart = getCart;

export function saveCart(cart: CartItem[]): void {
  setItem(STORAGE_KEYS.CART, cart);
}

// Wishlist
export function getWishlist(): string[] {
  return getItem<string[]>(STORAGE_KEYS.WISHLIST, ['prod-iphone-15', 'prod-dress-silk']);
}
export const getStoredWishlist = getWishlist;

export function saveWishlist(wishlist: string[]): void {
  setItem(STORAGE_KEYS.WISHLIST, wishlist);
}

// Language
export function getLanguage(): Language {
  return getItem<Language>(STORAGE_KEYS.LANGUAGE, 'uz');
}

export function saveLanguage(lang: Language): void {
  setItem(STORAGE_KEYS.LANGUAGE, lang);
}

// Currency Formatter
export function formatCurrency(amount: number, currencySuffix: string = "so'm"): string {
  if (isNaN(amount) || amount === undefined || amount === null) return `0 ${currencySuffix}`;
  const parts = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${parts} ${currencySuffix}`;
}

// Navigation and view state persistence (so page refresh maintains current state)
export function getSavedViewMode(): 'storefront' | 'admin' {
  try {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get('mode');
      if (mode === 'admin' || mode === 'storefront') {
        return mode;
      }
      if (window.location.hash.startsWith('#admin')) {
        return 'admin';
      }
    }
  } catch {}
  return getItem<'storefront' | 'admin'>(STORAGE_KEYS.VIEW_MODE, 'storefront');
}

export function saveViewMode(mode: 'storefront' | 'admin'): void {
  setItem(STORAGE_KEYS.VIEW_MODE, mode);
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'admin') {
        url.searchParams.set('mode', 'admin');
      } else {
        url.searchParams.delete('mode');
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  } catch {}
}

export function getSavedAdminTab(): string {
  try {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab');
      if (tab) return tab;
    }
  } catch {}
  return getItem<string>(STORAGE_KEYS.ADMIN_TAB, 'dashboard');
}

export function saveAdminTab(tab: string): void {
  setItem(STORAGE_KEYS.ADMIN_TAB, tab);
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'admin');
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  } catch {}
}

export function getSavedCategory(): string {
  try {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const cat = searchParams.get('category');
      if (cat) return cat;
    }
  } catch {}
  return getItem<string>(STORAGE_KEYS.CATEGORY, 'all');
}

export function saveCategorySelection(catId: string): void {
  setItem(STORAGE_KEYS.CATEGORY, catId);
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (catId && catId !== 'all') {
        url.searchParams.set('category', catId);
      } else {
        url.searchParams.delete('category');
      }
      window.history.replaceState({}, '', url.toString());
    }
  } catch {}
}

export function getSavedProductId(): string | null {
  try {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const pid = searchParams.get('product');
      if (pid) return pid;
    }
  } catch {}
  return getItem<string | null>(STORAGE_KEYS.PRODUCT_ID, null);
}

export function saveProductId(pid: string | null): void {
  setItem(STORAGE_KEYS.PRODUCT_ID, pid);
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (pid) {
        url.searchParams.set('product', pid);
      } else {
        url.searchParams.delete('product');
      }
      window.history.replaceState({}, '', url.toString());
    }
  } catch {}
}

export function getSavedActiveModal(): string | null {
  try {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const view = searchParams.get('view');
      if (view) return view;
    }
  } catch {}
  return getItem<string | null>(STORAGE_KEYS.ACTIVE_MODAL, null);
}

export function saveActiveModal(modal: string | null): void {
  setItem(STORAGE_KEYS.ACTIVE_MODAL, modal);
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (modal) {
        url.searchParams.set('view', modal);
      } else {
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, '', url.toString());
    }
  } catch {}
}

