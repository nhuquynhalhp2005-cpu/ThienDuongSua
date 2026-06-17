import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { Product, Order, UserProfile, SystemSettings, Slide } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

// Detection of whether Firebase is configured/active or running mock credentials
const isMockFirebase = () => {
  try {
    const config = require('../../firebase-applet-config.json');
    return !config || config.apiKey === 'mock_api_key_for_compilation_only';
  } catch (e) {
    return true;
  }
};

// ---------------- USER PROFILES SERVICES ----------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let data = docSnap.data() as UserProfile;
      if (data.email === 'nhuquynhalhp2005@gmail.com' && (data.role !== 'admin' || data.displayName !== 'Như Quỳnh')) {
        data = {
          ...data,
          role: 'admin',
          displayName: 'Như Quỳnh'
        };
        await saveUserProfile(data);
      }
      return data;
    }
    return null;
  } catch (error) {
    console.warn("Firestore getUserProfile failed, falling back to LocalStorage:", error);
    const localUsers = JSON.parse(localStorage.getItem('milkshop_users') || '[]');
    const localUser = localUsers.find((u: any) => u.uid === uid);
    if (localUser) {
      if (localUser.email === 'nhuquynhalhp2005@gmail.com' && (localUser.role !== 'admin' || localUser.displayName !== 'Như Quỳnh')) {
        localUser.role = 'admin';
        localUser.displayName = 'Như Quỳnh';
        localStorage.setItem('milkshop_users', JSON.stringify(localUsers));
      }
      return localUser;
    }
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn("Firestore saveUserProfile failed, saving to LocalStorage:", error);
    const localUsers = JSON.parse(localStorage.getItem('milkshop_users') || '[]');
    const index = localUsers.findIndex((u: any) => u.uid === profile.uid);
    if (index >= 0) {
      localUsers[index] = { ...localUsers[index], ...profile };
    } else {
      localUsers.push(profile);
    }
    localStorage.setItem('milkshop_users', JSON.stringify(localUsers));
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users;
  } catch (error) {
    console.warn("Firestore getAllUsers failed, reading LocalStorage:", error);
    return JSON.parse(localStorage.getItem('milkshop_users') || '[]');
  }
}

export async function updateUserRole(uid: string, newRole: "user" | "admin"): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { role: newRole });
  } catch (error) {
    console.warn("Firestore updateUserRole failed, writing LocalStorage:", error);
    const localUsers = JSON.parse(localStorage.getItem('milkshop_users') || '[]');
    const index = localUsers.findIndex((u: any) => u.uid === uid);
    if (index >= 0) {
      localUsers[index].role = newRole;
      localStorage.setItem('milkshop_users', JSON.stringify(localUsers));
    }
  }
}


// ---------------- PRODUCTS CATALOGUE SERVICES ----------------

export async function getAllProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    let products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    // Seed products in cloud if Firestore returns empty and we are running live
    if (products.length === 0) {
      console.log("Firestore products collection is empty. Seeding initial catalogue...");
      for (const initialProduct of INITIAL_PRODUCTS) {
        try {
          await addDoc(collection(db, 'products'), initialProduct);
        } catch (err) {
          console.error("Failed to seed product: " + initialProduct.name, err);
        }
      }
      // Fetch again after seed
      const newSnapshot = await getDocs(collection(db, 'products'));
      products = [];
      newSnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
    }
    return products;
  } catch (error) {
    console.warn("Firestore products fetch failed. Emulating client-side products catalogue:", error);
    let localProds = localStorage.getItem('milkshop_products');
    if (!localProds) {
      // Prefill local storage mock
      const seeded = INITIAL_PRODUCTS.map((p, idx) => ({ ...p, id: `prod-${idx + 1}` }));
      localStorage.setItem('milkshop_products', JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(localProds);
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const path = 'products';
  try {
    const docRef = await addDoc(collection(db, 'products'), product);
    return { ...product, id: docRef.id };
  } catch (error) {
    console.warn("Firestore addProduct failed, writing LocalStorage:", error);
    const localProds = JSON.parse(localStorage.getItem('milkshop_products') || '[]');
    const newProd = {
      ...product,
      id: `prod-local-${Date.now()}`
    };
    localProds.push(newProd);
    localStorage.setItem('milkshop_products', JSON.stringify(localProds));
    return newProd;
  }
}

export async function updateProduct(id: string, product: Product): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    const { id: _, ...rest } = product; // strip id out for writing
    await updateDoc(docRef, { ...rest });
  } catch (error) {
    console.warn("Firestore updateProduct failed, writing LocalStorage:", error);
    const localProds = JSON.parse(localStorage.getItem('milkshop_products') || '[]');
    const idx = localProds.findIndex((p: any) => p.id === id);
    if (idx >= 0) {
      localProds[idx] = { ...product };
      localStorage.setItem('milkshop_products', JSON.stringify(localProds));
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore deleteProduct failed, writing LocalStorage:", error);
    const localProds = JSON.parse(localStorage.getItem('milkshop_products') || '[]');
    const filtered = localProds.filter((p: any) => p.id !== id);
    localStorage.setItem('milkshop_products', JSON.stringify(filtered));
  }
}


// ---------------- ORDERS HISTORY SERVICES ----------------

export async function createOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const path = 'orders';
  try {
    const docRef = await addDoc(collection(db, 'orders'), order);
    return { ...order, id: docRef.id };
  } catch (error) {
    console.warn("Firestore createOrder failed, writing LocalStorage:", error);
    const localOrders = JSON.parse(localStorage.getItem('milkshop_orders') || '[]');
    const newOrder = {
      ...order,
      id: `order-local-${Date.now()}`
    };
    localOrders.push(newOrder);
    localStorage.setItem('milkshop_orders', JSON.stringify(localOrders));
    return newOrder;
  }
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    // Sort client-side for consistent output
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn("Firestore getOrdersByUser failed, gathering LocalStorage:", error);
    const localOrders = JSON.parse(localStorage.getItem('milkshop_orders') || '[]');
    return localOrders
      .filter((o: any) => o.userId === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getAllOrders(): Promise<Order[]> {
  const path = 'orders';
  try {
    const snapshot = await getDocs(collection(db, 'orders'));
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn("Firestore getAllOrders failed, reading LocalStorage:", error);
    return JSON.parse(localStorage.getItem('milkshop_orders') || '[]')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn("Firestore updateOrderStatus failed, writing LocalStorage:", error);
    const localOrders = JSON.parse(localStorage.getItem('milkshop_orders') || '[]');
    const idx = localOrders.findIndex((o: any) => o.id === orderId);
    if (idx >= 0) {
      localOrders[idx].status = status;
      localOrders[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('milkshop_orders', JSON.stringify(localOrders));
    }
  }
}

// ---------------- SYSTEM CONFIGURATION/SETTINGS SERVICES ----------------

export const DEFAULT_SETTINGS: SystemSettings = {
  brandName: "Thiên Đường",
  logoChar: "☁️",
  brandSuffix: "SỮA",
  address: "Cẩm Văn, An Quang, Hải Phòng",
  phone: "1900.8198 (8:00 - 21:00)",
  email: "nhuquynhalhp2005@gmail.com",
  footerText: "© 2026 Cửa Hàng Sữa Bột Thiên Đường Sữa - Bảo hành vàng chính hãng. Thiết kế bởi Google AI Studio.",
  bannerSlides: [
    {
      id: 1,
      badge: "KHAI TRƯƠNG ƯU ĐÃI",
      title: "Chào Mừng Khai Trương Thiên Đường Sữa",
      subtitle: "Bùng nổ Deal vàng dành riêng cho bé và mẹ yêu",
      description: "Tưng bừng chào đón Thiên Đường Sữa tại Hải Phòng với ngàn quà tặng đặc biệt, voucher tích điểm và chương trình bốc thăm may mắn vô cùng hấp dẫn.",
      buttonText: "Trải nghiệm ngay",
      bgGradient: "from-sky-500 to-blue-700",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      badge: "SỮA NHẬT CHÍNH HÃNG",
      title: "Trọn Vị Thanh Mát Dinh Dưỡng Meiji",
      subtitle: "Hỗ trợ hệ tiêu hóa tự nhiên & miễn dịch vượt trội",
      description: "Thương hiệu sữa bột hàng đầu uy tín số 1 Nhật Bản được Thiên Đường Sữa nhập khẩu trực tiếp, đầy đủ tem mác vàng cam kết chất lượng chuẩn vị nguyên bản.",
      buttonText: "Khám phá dòng Meiji",
      bgGradient: "from-amber-400 to-orange-650",
      image: "https://images.unsplash.com/photo-1550583794-a1552db1c251?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      badge: "DINH DƯỠNG TOÀN DIỆN",
      title: "Sống Vui Khỏe Mỗi Ngày Cùng Gia Đình",
      subtitle: "Bảo vệ hệ xương khớp dẻo dai & khối cơ khỏe mạnh",
      description: "Cung cấp đầy đủ các hoạt chất quý báu vượt trội sữa non HMO, Ensure Gold và Abbott Grow giúp tăng cường đề kháng toàn diện dành cho mọi lứa tuổi gia đình Việt.",
      buttonText: "Đặt mua dinh dưỡng",
      bgGradient: "from-teal-500 to-emerald-700",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=60"
    }
  ],
  homeCategoryTitle: "Chọn sữa bột phù hợp lứa tuổi",
  homeCategorySubtitle: "Mỗi độ tuổi có một nhu cầu năng lượng riêng. Chọn đúng phân khúc sữa bột để hấp thu tối ưu nhất.",
  homeCategories: [
    {
      key: 'children',
      title: "Sữa Cho Bé Yêu",
      subtitle: "Hỗ trợ phát triển chiều cao, IQ trí não",
      desc: "Thanh mát dễ tiêu hoá, dồi dào HMO, DHA và kháng thể sữa non đặc hiệu.",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop"
    },
    {
      key: 'adults',
      title: "Người Trưởng Thành",
      subtitle: "Tăng cường sức đề kháng bền bỉ",
      desc: "Nạp đạm, vitamin nhóm B dồi dào thúc đẩy trao đổi chất bảo vệ hoạt động hàng ngày.",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop"
    },
    {
      key: 'seniors',
      title: "Người Lớn Tuổi",
      subtitle: "Bảo vệ xương khớp vững chãi dẻo dai",
      desc: "Bổ sung canxi Nano hữu cơ giúp ngừa loãng xương, bảo vệ trái tim khoẻ mạnh dẻo dải.",
      image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop"
    },
    {
      key: 'pregnant',
      title: "Mẹ Bầu Dưỡng Thai",
      subtitle: "Thai nhi khoẻ mạnh, mẹ bầu rạng rỡ",
      desc: "Bổ sung Axit Folic, Sắt và Vitamin gảm triệu chứng ốm nghén ở phụ nữ mang thai.",
      image: "https://images.unsplash.com/photo-1531983412531-1f49a365f69a?w=400&auto=format&fit=crop"
    }
  ]
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const docRef = doc(db, 'settings', 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn("Firestore getSystemSettings failed, loading LocalStorage / defaults:", error);
    const local = localStorage.getItem('milkshop_settings');
    if (local) {
      try {
        return JSON.parse(local) as SystemSettings;
      } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  }
}

export async function saveSystemSettings(settings: SystemSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, settings);
    localStorage.setItem('milkshop_settings', JSON.stringify(settings));
  } catch (error) {
    console.warn("Firestore saveSystemSettings failed, saving to LocalStorage:", error);
    localStorage.setItem('milkshop_settings', JSON.stringify(settings));
  }
}

