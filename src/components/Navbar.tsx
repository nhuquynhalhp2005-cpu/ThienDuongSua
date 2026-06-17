import React from 'react';
import { ShoppingCart, LogIn, LogOut, User, FolderLock, ShoppingBag, Eye, HelpCircle, Sparkles } from 'lucide-react';
import { UserProfile, SystemSettings } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  cartCount: number;
  isDemoMode: boolean;
  settings?: SystemSettings;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onOpenAuth,
  onOpenSettings,
  cartCount,
  isDemoMode,
  settings
}: NavbarProps) {
  const brandName = settings?.brandName || "THIÊN ĐƯỜNG";
  const brandSuffix = settings?.brandSuffix || "SỮA";
  const logoChar = settings?.logoChar || "T";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-300">
      {/* Small top demo announcement bar if running offline */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-1.5 animate-pulse">
          <Eye className="w-3.5 h-3.5" />
          <span>Đang chạy ở Chế Độ Thử Nghiệm (Offline Demo). Bật Firebase trong cấu hình để dùng dữ liệu thật.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand Title */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-3xl bg-gradient-to-tr from-pink-200 via-amber-100 to-sky-200 flex items-center justify-center shadow-sm border border-white/60 group-hover:scale-115 group-hover:rotate-12 transition-all duration-300 relative select-none">
              <span className="relative z-10 w-8.5 h-8.5 flex items-center justify-center -translate-y-0.5 filter drop-shadow-[0_2px_4px_rgba(56,189,248,0.15)]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#f0f9ff" />
                    </linearGradient>
                  </defs>
                  {/* Fluffy white cloud body */}
                  <path
                    d="M22,72 C12,72 5,64 5,54 C5,45 11,38 19,37 C23,22 37,12 53,12 C67,12 79,22 82,36 C89,38 95,44 95,52 C95,63 87,71 76,71 L22,71 Z"
                    fill="url(#cloudGrad)"
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
              
              {/* Golden shimmering sparkles reflecting "lấp lánh tinh khôi" */}
              <div className="absolute -top-1.5 -right-1.5 bg-white text-amber-400 p-0.5 rounded-full shadow-xs border border-amber-100 animate-bounce group-hover:scale-125 transition-all duration-300 z-20">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-500 animate-pulse" />
              </div>

              {/* Additional tiny ambient sparkles inside the logo container */}
              <div className="absolute top-1 left-2.5 w-1.5 h-1.5 bg-white rounded-full animate-ping pointer-events-none" />
              <div className="absolute bottom-1 right-2.5 w-1 h-1 bg-white rounded-full animate-pulse pointer-events-none" />
              <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-sky-600 to-blue-800 bg-clip-text text-transparent uppercase flex items-center gap-1.5">
                {brandName} <span className="text-amber-500">{brandSuffix}</span>
              </span>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase leading-none mt-0.5">Sữa Bột Dinh Dưỡng</p>
            </div>
          </div>

          {/* Core Pages Tabs Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`hover:text-primary-600 transition-colors py-2 flex items-center gap-1.5 ${
                activeTab === 'home' ? 'text-primary-600 border-b-2 border-primary-500' : ''
              }`}
            >
              Trang Chủ
            </button>
            <button
              id="nav-tab-shop"
              onClick={() => setActiveTab('shop')}
              className={`hover:text-primary-600 transition-colors py-2 flex items-center gap-1.5 ${
                activeTab === 'shop' ? 'text-primary-600 border-b-2 border-primary-500' : ''
              }`}
            >
              Cửa Hàng Sữa
            </button>
            <button
              id="nav-tab-cart"
              onClick={() => setActiveTab('cart')}
              className={`hover:text-primary-600 transition-colors py-2 relative flex items-center gap-1.5 ${
                activeTab === 'cart' ? 'text-primary-600' : ''
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Giỏ Hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-4 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user && (
              <button
                id="nav-tab-orders"
                onClick={() => setActiveTab('orders')}
                className={`hover:text-primary-600 transition-colors py-2 flex items-center gap-1.5 ${
                  activeTab === 'orders' ? 'text-primary-600 border-b-2 border-primary-500' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Lịch Sử Mua Hàng
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`text-red-600 hover:text-red-700 transition-colors py-1.5 px-3 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-1.5 border border-red-200/50 ${
                  activeTab === 'admin' ? 'font-bold bg-red-100 ring-1 ring-red-300' : ''
                }`}
              >
                <FolderLock className="w-4 h-4 animate-pulse" />
                Vùng Quản Trị
              </button>
            )}
          </nav>

          {/* User authentication states actions */}
          <div className="flex items-center gap-4">
            
            {/* Quick Admin Button for Mobile */}
            {user?.role === 'admin' && (
              <button
                id="nav-admin-btn-mobile"
                onClick={() => setActiveTab('admin')}
                className="md:hidden relative p-2.5 rounded-xl text-red-600 hover:text-red-700 bg-red-100/50 hover:bg-red-100 transition-colors"
                title="Vùng Quản Trị"
              >
                <FolderLock className="w-5 h-5" />
              </button>
            )}

            {/* Quick shopping cart on small screens */}
            <button
              id="nav-cart-btn-mobile"
              onClick={() => setActiveTab('cart')}
              className="md:hidden relative p-2.5 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
              aria-label="Mobile cart"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Visual Avatar Name Badge & clickable Settings icon wrapper */}
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center gap-2 text-left hover:bg-stone-50 p-1.5 rounded-2xl border border-transparent hover:border-stone-100 transition-all active:scale-95 text-stone-700"
                  title="Cài đặt tài khoản"
                >
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-black text-stone-850 leading-tight">{user.displayName}</span>
                    <span className="text-[10px] font-semibold text-stone-400 capitalize hover:text-sky-600">
                      {user.role === 'admin' ? '👑 Quản trị viên' : '⚙️ Cài đặt'}
                    </span>
                  </div>
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName}
                      className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-extrabold text-sm flex items-center justify-center uppercase shadow-sm">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                </button>
                
                {/* Sign Out Trigger */}
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  className="p-2.5 rounded-xl text-stone-500 hover:text-red-600 hover:bg-stone-50 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                id="nav-btn-login"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Đăng Nhập
              </button>
            )}

          </div>
        </div>
      </div>
      
      {/* Mobile nav rail helper - small bottom navigation tabs for extreme mobile support */}
      <div className="md:hidden flex justify-around items-center h-12 bg-stone-50 border-t border-stone-100 px-2 text-[11px] font-semibold text-stone-500">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 text-center py-1.5 ${activeTab === 'home' ? 'text-primary-600 font-extrabold' : ''}`}
        >
          Trang chủ
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 text-center py-1.5 ${activeTab === 'shop' ? 'text-primary-600 font-extrabold' : ''}`}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex-1 text-center py-1.5 ${activeTab === 'cart' ? 'text-primary-600 font-extrabold' : ''}`}
        >
          Giỏ hàng ({cartCount})
        </button>
        {user?.role === 'admin' ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 text-center py-1.5 text-red-600 font-bold ${activeTab === 'admin' ? 'text-red-700 font-extrabold' : ''}`}
          >
            ⚙️ Quản trị
          </button>
        ) : (
          user && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 text-center py-1.5 ${activeTab === 'orders' ? 'text-primary-600 font-extrabold' : ''}`}
            >
              Đơn hàng
            </button>
          )
        )}
      </div>
    </header>
  );
}
