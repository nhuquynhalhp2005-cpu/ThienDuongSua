import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  getUserProfile, 
  getAllProducts, 
  getOrdersByUser, 
  getAllOrders, 
  getAllUsers,
  saveUserProfile,
  getSystemSettings,
  DEFAULT_SETTINGS
} from './firebase/dbService';
import { Product, CartItem, Order, UserProfile, MilkCategory, SystemSettings } from './types';

// Import subcomponents
import Navbar from './components/Navbar';
import BannerSlider from './components/BannerSlider';
import AuthModal from './components/AuthModal';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import AdminPanel from './components/AdminPanel';
import UserSettingsModal from './components/UserSettingsModal';

import { 
  Heart, ShieldCheck, Truck, Star, Award, MapPin, 
  Phone, Mail, Facebook, Youtube, Play, PackageSearch, HelpCircle, Eye, Plus
} from 'lucide-react';

// Small responsive countdown clock for e-commerce Flash Sale urgencies
function CountdownTimer({ durationMinutes }: { durationMinutes?: number }) {
  const [secondsLeft, setSecondsLeft] = useState((durationMinutes ?? 120) * 60);

  useEffect(() => {
    setSecondsLeft((durationMinutes ?? 120) * 60);
  }, [durationMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          return (durationMinutes ?? 120) * 60; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [durationMinutes]);

  const hr = Math.floor(secondsLeft / 3600);
  const min = Math.floor((secondsLeft % 3600) / 60);
  const sec = secondsLeft % 60;

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <span>{format(hr)}:{format(min)}:{format(sec)}</span>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'cart' | 'orders' | 'admin'>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // System Configuration settings state
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // Core Data Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Category filter preset carrier for home-to-shop transitions
  const [homeCategoryFilter, setHomeCategoryFilter] = useState<string>('all');

  // Load settings on initial component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const sysSettings = await getSystemSettings();
        setSettings(sysSettings);
      } catch (e) {
        console.warn("Could not load initial system settings", e);
      }
    };
    fetchSettings();
  }, []);

  // Check if Firebase is running in mock offline state
  useEffect(() => {
    try {
      const isMock = localStorage.getItem('milkshop_demo_active') === 'true' || 
                      firebaseConfig.apiKey === 'mock_api_key_for_compilation_only';
      // If we see an unauthorized error or mock, we mark isDemoMode
      setIsDemoMode(isMock);
    } catch (e) {}
  }, []);

  // 1. Subscribe to Firebase Authentication States
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setIsDemoMode(false);
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
          } else {
            // Self-create user profile as default
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Thành viên Milk',
              role: firebaseUser.email === 'nhuquynhalhp2005@gmail.com' ? 'admin' : 'user',
              createdAt: new Date().toISOString()
            };
            await saveUserProfile(newProfile);
            setUser(newProfile);
          }
        } catch (err) {
          console.error("Auth profile fetch error, checking local/demo modes...", err);
        }
      } else {
        // Only clear user if we are NOT in local mock bypass session
        const localSession = sessionStorage.getItem('milkshop_demo_user');
        if (localSession) {
          const parsed = JSON.parse(localSession);
          setUser(parsed);
          setIsDemoMode(true);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Core Catalog, Orders and Profile Logs
  const loadData = async () => {
    try {
      const prods = await getAllProducts();
      setProducts(prods);

      try {
        const sysSettings = await getSystemSettings();
        setSettings(sysSettings);
      } catch (err) {}

      if (user) {
        if (user.role === 'admin') {
          const allOrders = await getAllOrders();
          setOrders(allOrders);
          const allUsers = await getAllUsers();
          setUsers(allUsers);
        } else {
          const myOrders = await getOrdersByUser(user.uid);
          setOrders(myOrders);
        }
      }
    } catch (err) {
      console.warn("Unable to load cloud Firestore elements, continuing local cache sync:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Load Cart from localStorage on start
  useEffect(() => {
    const savedCart = localStorage.getItem('milkshop_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  // Sync Cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('milkshop_cart', JSON.stringify(newCart));
  };

  // 3. CART ACTIONS
  const handleAddToCart = (product: Product, quantity: number) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      const updatedQty = Math.min(product.stock, existing.quantity + quantity);
      const updatedCart = cart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: updatedQty } : item
      );
      saveCart(updatedCart);
    } else {
      saveCart([...cart, { product, quantity }]);
    }
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const cappedQty = Math.min(product.stock, newQty);
    const updatedCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity: cappedQty } : item
    );
    saveCart(updatedCart);
  };

  const handleRemoveCartItem = (productId: string) => {
    const filtered = cart.filter((item) => item.product.id !== productId);
    saveCart(filtered);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  // 4. AUTH SUCCESS TRIGGER
  const handleAuthSuccess = (profile: UserProfile) => {
    setUser(profile);
    if (profile.uid.startsWith('mock-')) {
      setIsDemoMode(true);
      sessionStorage.setItem('milkshop_demo_user', JSON.stringify(profile));
      localStorage.setItem('milkshop_demo_active', 'true');
    } else {
      setIsDemoMode(false);
      localStorage.removeItem('milkshop_demo_active');
    }
    loadData();
  };

  const handleUpdateUserSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    loadData();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setIsDemoMode(false);
    sessionStorage.removeItem('milkshop_demo_user');
    localStorage.removeItem('milkshop_demo_active');
    setActiveTab('home');
    alert("Đã đăng xuất khỏi tài khoản của bạn.");
  };

  // Transition category clicks from homepage to shopview
  const handleHomeCategoryClick = (categoryKey: string) => {
    setHomeCategoryFilter(categoryKey);
    setActiveTab('shop');
  };

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      
      {/* Header element overlay */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setAuthOpen(true)} 
        onOpenSettings={() => setUserSettingsOpen(true)}
        cartCount={cartItemsCount}
        isDemoMode={isDemoMode}
        settings={settings}
      />

      {/* Main stage with padding */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* VIEW A: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-16 animate-fade-in text-left">
            
            {/* Advertising banner carousel */}
            <BannerSlider onShopClick={() => setActiveTab('shop')} customSlides={settings.bannerSlides} />

            {/* DEMOGRAPHICS / CATEGORIES SECTION */}
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-black tracking-widest text-primary-500 uppercase">TIÊU CHUẨN DINH DƯỠNG</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-stone-850 tracking-tight">
                  {settings.homeCategoryTitle || "Chọn sữa bột phù hợp lứa tuổi"}
                </h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  {settings.homeCategorySubtitle || "Mỗi độ tuổi có một nhu cầu năng lượng riêng. Chọn đúng phân khúc sữa bột để hấp thu tối ưu nhất."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(settings.homeCategories || [
                  {
                    key: 'children',
                    title: "Sữa Cho Bé Yêu",
                    subtitle: "Hỗ trợ phát triển chiều cao, IQ trí não",
                    desc: "Thanh mát dễ tiêu hoá, dồi dào HMO, DHA và kháng thể sữa non đặc hiệu.",
                    color: "border-sky-100 hover:border-sky-400 bg-sky-50/20 text-sky-600",
                    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop"
                  },
                  {
                    key: 'adults',
                    title: "Người Trưởng Thành",
                    subtitle: "Tăng cường sức đề kháng bền bỉ",
                    desc: "Nạp đạm, vitamin nhóm B dồi dào thúc đẩy trao đổi chất bảo vệ hoạt động hàng ngày.",
                    color: "border-teal-100 hover:border-teal-400 bg-teal-50/20 text-teal-600",
                    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop"
                  },
                  {
                    key: 'seniors',
                    title: "Người Lớn Tuổi",
                    subtitle: "Bảo vệ xương khớp vững chãi dẻo dai",
                    desc: "Bổ sung canxi Nano hữu cơ giúp ngừa loãng xương, bảo vệ trái tim khoẻ mạnh dẻo dải.",
                    color: "border-amber-100 hover:border-amber-400 bg-amber-50/20 text-amber-600",
                    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop"
                  },
                  {
                    key: 'pregnant',
                    title: "Mẹ Bầu Dưỡng Thai",
                    subtitle: "Thai nhi khoẻ mạnh, mẹ bầu rạng rỡ",
                    desc: "Bổ sung Axit Folic, Sắt và Vitamin gảm triệu chứng ốm nghén ở phụ nữ mang thai.",
                    color: "border-pink-100 hover:border-pink-400 bg-pink-50/20 text-pink-600",
                    image: "https://images.unsplash.com/photo-1531983412531-1f49a365f69a?w=400&auto=format&fit=crop"
                  }
                ]).map((item) => {
                  let colorClass = "border-sky-100 hover:border-sky-400 bg-sky-50/20 text-sky-600";
                  if (item.key === 'adults') colorClass = "border-teal-100 hover:border-teal-400 bg-teal-50/20 text-teal-600";
                  if (item.key === 'seniors') colorClass = "border-amber-100 hover:border-amber-400 bg-amber-50/20 text-amber-600";
                  if (item.key === 'pregnant') colorClass = "border-pink-100 hover:border-pink-400 bg-pink-50/20 text-pink-600";
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleHomeCategoryClick(item.key)}
                      className={`p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50 ${colorClass}`}
                    >
                      <img src={item.image} className="w-14 h-14 object-cover rounded-xl border mb-3" alt="" referrerPolicy="no-referrer" />
                      <h4 className="text-base font-extrabold text-stone-850 leading-tight">{item.title}</h4>
                      <p className="text-[11px] font-bold text-stone-500 mt-0.5 leading-none">{item.subtitle}</p>
                      <p className="text-[11px] text-stone-400 leading-relaxed mt-2.5">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 1. CHƯƠNG TRÌNH FLASH SALE GIỜ VÀNG */}
            <section className="bg-gradient-to-br from-red-50 to-amber-50 rounded-3.5xl p-6 md:p-8 border border-red-150 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center text-white text-xl animate-pulse">
                    🔥
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-stone-850 tracking-tight flex items-center gap-2 uppercase">
                      {settings.flashSaleTitle || "CƠN LỐC FLASH SALE"}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {settings.flashSaleSubtitle || "Săn giá hời - Số lượng giới hạn dành riêng cho bé"}
                    </p>
                  </div>
                </div>

                {/* Countdown clock representation */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-2xl shadow-sm text-xs md:text-sm font-extrabold font-mono">
                  <span className="uppercase text-[9px] tracking-wider mr-1.5 font-sans">KẾT THÚC SAU:</span>
                  <CountdownTimer durationMinutes={settings.flashSaleDurationMinutes} />
                </div>
              </div>

              {/* Flash Sale Products Item list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const discountPct = settings.flashSaleDiscount ?? 15;
                  const factor = (100 - discountPct) / 100;
                  
                  // Filter products based on flashSaleProductIds in settings, or fallback to first 3 products
                  let flashSaleProducts = products.filter(p => settings.flashSaleProductIds?.includes(p.id ?? ""));
                  if (flashSaleProducts.length === 0) {
                    flashSaleProducts = products.slice(0, 3);
                  }
                  
                  return flashSaleProducts.map((p) => {
                    const salePrice = Math.round(p.price * factor);
                    const percent = 82; // mock sold bar
                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-3xl border border-red-100 p-4 transition-all hover:shadow-lg flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Sale Tag badge */}
                        <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-lg shadow-sm z-10">
                          GIẢM {discountPct}%
                        </div>

                        <div>
                          {/* Product Image */}
                          <div className="h-44 bg-stone-50/50 rounded-2xl flex items-center justify-center p-3 relative mb-4">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="text-left space-y-1 bg-white">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-600">{p.brand}</span>
                              <span className="text-[9px] text-stone-400 font-semibold">• Sữa chính hãng</span>
                            </div>
                            <h4 className="text-xs font-extrabold text-stone-800 line-clamp-2 h-9 leading-snug">
                              {p.name}
                            </h4>
                          </div>
                        </div>

                        {/* Sale price and add CTA */}
                        <div className="space-y-3 pt-3 border-t border-stone-100 mt-3 text-left">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-stone-400 font-semibold">{p.weight || "900g / Lon"}</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-xs text-stone-400 line-through">{p.price.toLocaleString()}đ</span>
                              <span className="text-sm font-black text-red-600">{salePrice.toLocaleString()}đ</span>
                            </div>
                          </div>

                          {/* Sold progressive bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-stone-450 font-bold">
                              <span>Đã bán 78%</span>
                              <span className="text-red-600">Sắp cháy hàng!</span>
                            </div>
                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>

                          {/* Action click */}
                          <button
                            id={`flash-add-${p.id}`}
                            onClick={() => {
                              handleAddToCart({...p, price: salePrice}, 1);
                              alert(`Đã thêm ${p.name} với giá Flash Sale đặc biệt vào giỏ hàng!`);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-600 text-white font-extrabold text-xs rounded-2xl hover:shadow-md cursor-pointer active:scale-[0.98] transition-all text-center"
                          >
                            🔥 Đặt Giao Tốc Hành
                          </button>
                        </div>

                      </div>
                    );
                  });
                })()}
              </div>
            </section>

            {/* 2. SẢN PHẨM MỚI NHẤT TRÊN KỆ */}
            <section className="space-y-6 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-base">✨</span>
                <div>
                  <h3 className="text-lg font-black text-stone-850 tracking-tight">SIÊU PHẨM MỚI NHẬP KỆ</h3>
                  <p className="text-[11px] text-stone-400 font-medium font-sans">Dinh dưỡng thế hệ mới phát triển vượt trội cho bé yêu và gia đình</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.filter(p => p.isNew).slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl border border-stone-150 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image card banner */}
                      <div className="h-48 bg-stone-50/50 flex items-center justify-center p-3 relative">
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-extrabold uppercase">Mới</span>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain rounded-2xl group-hover:scale-105 duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info Text block */}
                      <div className="p-4 text-left space-y-1 bg-white">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-400">{p.brand}</span>
                        <h4 className="text-xs font-bold text-stone-800 line-clamp-2 h-9 leading-snug hover:text-sky-600 transition-colors cursor-pointer" onClick={() => setActiveTab('shop')}>
                          {p.name}
                        </h4>
                      </div>
                    </div>

                    {/* Price and Add button area */}
                    <div className="p-4 pt-2 border-t border-stone-50 flex items-end justify-between text-left">
                      <div>
                        <span className="text-[10px] font-semibold text-stone-350 block mb-0.5">{p.weight || "Hộp 900g"}</span>
                        <span className="text-xs font-mono font-black text-amber-500">
                          {p.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          handleAddToCart(p, 1);
                          alert(`Đã thêm ${p.name} vào giỏ hàng!`);
                        }}
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center hover:scale-105 active:scale-[0.95] duration-200 cursor-pointer shadow-sm"
                        title="Thêm vào giỏ"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. SỮA BỘT BÁN CHẠY NHẤT */}
            <section className="space-y-6 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white text-base">🏆</span>
                <div>
                  <h3 className="text-lg font-black text-stone-850 tracking-tight">SỮA BỘT BÁN CHẠY NHẤT</h3>
                  <p className="text-[11px] text-stone-400 font-medium font-sans">Top các dòng sữa bột uy tín được các bà mẹ Việt tuyệt đối tin chọn</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.filter(p => p.featured).slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl border border-stone-150 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image card banner */}
                      <div className="h-48 bg-stone-50/50 flex items-center justify-center p-3 relative">
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-red-500 text-white text-[9px] font-extrabold uppercase">Bán Chạy</span>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain rounded-2xl group-hover:scale-105 duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info Text block */}
                      <div className="p-4 text-left space-y-1 bg-white">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-400">{p.brand}</span>
                        <h4 className="text-xs font-bold text-stone-800 line-clamp-2 h-9 leading-snug hover:text-sky-600 transition-colors cursor-pointer" onClick={() => setActiveTab('shop')}>
                          {p.name}
                        </h4>
                      </div>
                    </div>

                    {/* Price and Add button area */}
                    <div className="p-4 pt-2 border-t border-stone-50 flex items-end justify-between text-left">
                      <div>
                        <span className="text-[10px] font-semibold text-stone-350 block mb-0.5">{p.weight || "Hộp 900g"}</span>
                        <span className="text-xs font-mono font-black text-amber-500">
                          {p.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          handleAddToCart(p, 1);
                          alert(`Đã thêm ${p.name} vào giỏ hàng!`);
                        }}
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center hover:scale-105 active:scale-[0.95] duration-200 cursor-pointer shadow-sm"
                        title="Thêm vào giỏ"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* VIEW B: SHOP VIEW */}
        {activeTab === 'shop' && (
          <div className="animate-fade-in">
            <ShopView 
              products={products} 
              onAddToCart={handleAddToCart} 
              initialCategoryFilter={homeCategoryFilter}
              onClearInitialCategoryFilter={() => setHomeCategoryFilter('all')}
            />
          </div>
        )}

        {/* VIEW C: SHOPPING CART */}
        {activeTab === 'cart' && (
          <div className="animate-fade-in">
            <CartView
              cart={cart}
              onUpdateQty={handleUpdateCartQty}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              user={user}
              orders={orders}
              onOpenAuth={() => setAuthOpen(true)}
              onOrderCompleted={() => setActiveTab('orders')}
            />
          </div>
        )}

        {/* VIEW D: PURCHASE RUNNING HISTORY */}
        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-stone-850">Lịch sử tích lũy & đặt hàng của bạn</h3>
                <p className="text-xs text-stone-400">Danh sách các thùng sữa bột đã được xuất kho và giao tới nhà bạn</p>
              </div>
              <button 
                onClick={loadData}
                className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1"
              >
                Tải lại đơn hàng mới
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-16 text-center bg-white border border-stone-150 rounded-3xl shrink-0 space-y-4">
                <PackageSearch className="w-12 h-12 text-stone-300 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-stone-750">Bạn chưa đặt hộp sữa nào từ trước tới nay</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">Tạo tài khoản thành viên đặt sữ để bắt đầu lịch trình dinh dưỡng của bạn dồi dào sức khoẻ nhé!</p>
                </div>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-450 to-blue-600 text-white font-bold text-xs rounded-xl hover:shadow cursor-pointer"
                >
                  Mua sắm sữa bột ngay
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 bg-white border border-stone-150 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                      <div>
                        <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest block leading-none">Mã: #{o.id?.substring(0, 10).toUpperCase()}</span>
                        <span className="text-xs font-bold text-stone-800">{o.customerName} - {o.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                          o.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {o.status === 'Pending' ? 'Đang Chờ Duyệt' :
                           o.status === 'Confirmed' ? 'Đã Xác Nhận' :
                           o.status === 'Shipping' ? 'Đang Vận Chuyển' :
                           o.status === 'Delivered' ? 'Giao Thành Công' : 'Đã Huỷ bỏ'}
                        </span>
                        <span className="text-stone-450 text-[10.5px] font-mono">
                          {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {/* Miniature view items */}
                    <div className="space-y-1.5 pt-1">
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-stone-600 text-left">
                          <span className="font-semibold">{it.name} <span className="text-[10px] text-stone-400 font-bold font-mono">x{it.quantity}</span></span>
                          <span className="font-bold text-stone-800 text-right shrink-0">{(it.price * it.quantity).toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping locations address */}
                    <div className="text-[11px] text-stone-400 flex items-center gap-1 border-t pt-2 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>Giao tới địa chỉ: {o.address}</span>
                    </div>

                    {/* Subtotals info */}
                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-[11px] font-bold text-stone-450 uppercase">TỔNG TOÀN ĐƠN MUA SỮA</span>
                      <span className="text-base font-extrabold text-amber-500 font-mono">
                        {o.total.toLocaleString()}đ
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW E: EXCLUSIVE ADMIN DASHBOARD */}
        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              products={products}
              orders={orders}
              users={users}
              onRefreshData={loadData}
              settings={settings}
            />
          </div>
        )}

      </main>

      {/* FOOTER SECTION contains brand details and contact info */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 pt-16 pb-8 transition-colors text-left mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo brand disclaimer Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-200 via-amber-100 to-sky-200 flex items-center justify-center shadow-sm border border-stone-800 select-none relative group">
                <span className="relative z-10 w-7.5 h-7.5 flex items-center justify-center -translate-y-0.5 filter drop-shadow-[0_1.5px_2px_rgba(56,189,248,0.15)]">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="logoMilkDropFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="60%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#f0f9ff" />
                      </linearGradient>
                    </defs>
                    {/* Fluffy white cloud body */}
                    <path
                      d="M22,72 C12,72 5,64 5,54 C5,45 11,38 19,37 C23,22 37,12 53,12 C67,12 79,22 82,36 C89,38 95,44 95,52 C95,63 87,71 76,71 L22,71 Z"
                      fill="url(#logoMilkDropFooter)"
                    />
                    {/* Cute glowing eyes */}
                    <path d="M 33,45 Q 37,42 41,45" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                    <path d="M 59,45 Q 63,42 67,45" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                    {/* Smiling mouth */}
                    <path d="M 47,50 Q 50,54 53,50" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                    {/* Blushing cheeks */}
                    <ellipse cx="29" cy="51" rx="4.5" ry="2.5" fill="#ec4899" opacity="0.45" />
                    <ellipse cx="71" cy="51" rx="4.5" ry="2.5" fill="#ec4899" opacity="0.45" />
                  </svg>
                </span>
                <span className="absolute -top-1 -right-1 text-amber-400 text-xs animate-bounce">✨</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-1.5">{settings.brandName} <span className="text-amber-500">{settings.brandSuffix}</span></span>
            </div>
            
            <p className="text-xs text-stone-400 leading-relaxed">
              Thương hiệu nhập khẩu và bán lẻ sữa bột dinh dưỡng hàng đầu Việt Nam tại Hải Phòng cho em bé, người già, phụ nữ mang thai và sức khỏe đại chúng. Đạt tiêu chuẩn ISO 22000 về vệ sinh đóng lon.
            </p>
            
            <div className="flex gap-3 pt-2 text-stone-500">
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Youtube"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick link tags demography Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Danh mục sữa bột</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><button onClick={() => handleHomeCategoryClick('children')} className="hover:text-white transition-colors">Sữa Bột Trẻ Em 1-6 Tuổi</button></li>
              <li><button onClick={() => handleHomeCategoryClick('adults')} className="hover:text-white transition-colors">Sữa Dinh Dưỡng Người Lớn</button></li>
              <li><button onClick={() => handleHomeCategoryClick('seniors')} className="hover:text-white transition-colors">Sữa Canxi Kéo Dài Người Già</button></li>
              <li><button onClick={() => handleHomeCategoryClick('pregnant')} className="hover:text-white transition-colors">Sữa Dưỡng Thai Mẹ Bầu</button></li>
            </ul>
          </div>

          {/* Customer policies Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Đảm bảo & Cam kết</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 font-medium">✓ Đóng lon niêm phong tuyệt đối</li>
              <li className="flex items-center gap-1.5 font-medium">✓ Miễn phí hoàn hàng đổi can 1-1</li>
              <li className="flex items-center gap-1.5 font-medium">✓ Ship hỏa tốc 2 giờ nội đô</li>
              <li className="flex items-center gap-1.5 font-medium">✓ Tư vấn dinh dưỡng miễn phí</li>
            </ul>
          </div>

          {/* Direct Address Contacts Footer Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Thông Tin Liên Hệ</h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-mono text-white font-bold">Hotline: {settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-mono text-stone-300">{settings.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Minimal copyright disclaimer footer border */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-800/80 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-[11px] text-stone-500 font-medium gap-4">
          <span>{settings.footerText}</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Điều khoản bảo mật</a>
            <a href="#" className="hover:underline">Chính sách vận chuyển</a>
          </div>
        </div>
      </footer>

      {/* Auth Control Center Modal triggers */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {user && (
        <UserSettingsModal
          isOpen={userSettingsOpen}
          onClose={() => setUserSettingsOpen(false)}
          user={user}
          onUpdateSuccess={handleUpdateUserSuccess}
        />
      )}

    </div>
  );
}
