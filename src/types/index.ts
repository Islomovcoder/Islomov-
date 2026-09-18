export type Language = 'uz' | 'ru' | 'en';

export type UserRole = 'admin' | 'manager' | 'courier' | 'customer';

export type OrderStatus = 'new' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';

export type PaymentMethod = 'payme' | 'click' | 'uzcard' | 'cash';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Category {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  iconName: string;
  image: string;
  subcategories: {
    id: string;
    nameUz: string;
    nameRu: string;
    nameEn: string;
    slug: string;
  }[];
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase?: boolean;
}

export interface Product {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  categoryId: string;
  subcategoryId?: string;
  price: number; // in UZS
  discountPrice?: number; // in UZS if on sale
  sku: string;
  stock: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviewsCount: number;
  reviews: ProductReview[];
  featured?: boolean;
  isNew?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique item id (productId + size + color)
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: { name: string; hex: string };
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    city: string;
    street: string;
    apartment?: string;
    landmark?: string;
    notes?: string;
  };
  deliveryType: 'standard' | 'express';
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountPercent?: number;
  discountAmount?: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount?: number;
  validUntil?: string;
  expiryDate?: string;
  isActive: boolean;
  usageCount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  ordersCount?: number;
  totalOrders?: number;
  segment: 'vip' | 'regular' | 'new' | 'VIP' | 'Regular' | 'New';
  registeredAt?: string;
  createdAt?: string;
  savedAddresses?: string[];
  addresses?: string[];
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  telegramChannel: string;
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  freeDeliveryThreshold: number;
  currency: string;
  taxPercent?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  active: boolean;
}
