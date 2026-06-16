export interface Product {
  id?: string; // Document ID in Firestore
  name: string;
  price: number;
  brand: string;
  category: "children" | "adults" | "seniors" | "pregnant";
  description: string;
  imageUrl: string;
  stock: number;
  featured: boolean;
  isNew: boolean;
  createdAt: string; // ISO string
}

export type MilkCategory = "children" | "adults" | "seniors" | "pregnant";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  buttonText: string;
  bgGradient: string;
  image: string;
}

export interface HomeCategorySetting {
  key: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
}

export interface SystemSettings {
  brandName: string;
  logoChar: string;
  brandSuffix: string;
  address: string;
  phone: string;
  email: string;
  footerText: string;
  bannerSlides: Slide[];
  homeCategoryTitle?: string;
  homeCategorySubtitle?: string;
  homeCategories?: HomeCategorySetting[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id?: string; // Document ID in Firestore
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string; // "COD" | "Transfer"
  items: OrderItem[];
  total: number;
  status: "Pending" | "Confirmed" | "Shipping" | "Delivered" | "Cancelled";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
