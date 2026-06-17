import React, { useState } from 'react';
import { X, Mail, Lock, User, MapPin, Phone, Sparkles, Shield, AlertCircle, RefreshCw, Eye, EyeOff, Chrome } from 'lucide-react';
import { auth, googleProvider } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { saveUserProfile, getUserProfile } from '../firebase/dbService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
}

type AuthTab = 'login' | 'register' | 'forgot';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>('login');
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleTabChange = (newTab: AuthTab) => {
    setTab(newTab);
    handleReset();
  };

  // Google popup sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    handleReset();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile already exists
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        // Create new profile for Google users
        profile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Khách hàng Google',
          role: user.email === 'nhuquynhalhp2005@gmail.com' ? 'admin' : 'user', // Bootstrap Admin first
          phone: '',
          address: '',
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      } else if (user.email === 'nhuquynhalhp2005@gmail.com' && (profile.role !== 'admin' || profile.displayName !== 'Như Quỳnh')) {
        profile.role = 'admin';
        profile.displayName = 'Như Quỳnh';
        await saveUserProfile(profile);
      }
      
      setSuccessMessage("Đăng nhập bằng tài khoản Google thành công!");
      setTimeout(() => {
        onAuthSuccess(profile!);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errorCode = err?.code || "";
      if (errorCode === "auth/unauthorized-domain") {
        setErrorMessage(
          "Lỗi: Tên miền này chưa được cấu hình. Vui lòng vào Firebase Console > Authentication > Settings (Cài đặt) > Authorized Domains và thêm tên miền hiện tại của bạn (Ví dụ: tên miền Vercel của bạn) để cho phép đăng nhập Google."
        );
      } else if (errorCode === "auth/operation-not-allowed") {
        setErrorMessage(
          "Dịch vụ đăng nhập bằng Google chưa được bật. Vui lòng vào Firebase Console > Authentication > Sign-in method và Bật (Enable) phương thức đăng nhập bằng Google."
        );
      } else if (err?.message?.includes("popup-closed-by-user") || errorCode === "auth/popup-closed-by-user") {
        setErrorMessage("Cửa sổ đăng nhập Google bị đóng trước khi hoàn thành.");
      } else {
        setErrorMessage("Lỗi xác thực Google: " + (err?.message || "Vui lòng kiểm tra lại cấu hình Firebase của bạn."));
      }
    } finally {
      setLoading(false);
    }
  };

  // Login Email/Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }
    setLoading(true);
    handleReset();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        // Fallback profile if Firestore entry not found but Auth user exists
        profile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Thành viên cũ',
          role: user.email === 'nhuquynhalhp2005@gmail.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      }
      
      setSuccessMessage("Đăng nhập thành công!");
      setTimeout(() => {
        onAuthSuccess(profile!);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.warn("Firebase Auth error, checking fallback admin and local login:", err);
      const isSystemAdmin = email.trim().toLowerCase() === 'nhuquynhalhp2005@gmail.com';
      const localUsers = JSON.parse(localStorage.getItem('milkshop_users') || '[]');
      const matchingUserIndex = localUsers.findIndex((u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      const matchingUser = matchingUserIndex !== -1 ? localUsers[matchingUserIndex] : null;

      const errCode = err?.code || "";
      if (errCode === "auth/wrong-password" || errCode === "auth/invalid-credential") {
        setErrorMessage("Mật khẩu không chính xác. Vui lòng thử lại.");
        return;
      }

      if (isSystemAdmin) {
        // Ultimate admin bypass - Allows admin login with email/password even if Firebase email login is disabled
        if (matchingUser) {
          if (matchingUser.password && matchingUser.password !== password) {
            setErrorMessage("Mật khẩu admin không chính xác. Vui lòng thử lại.");
            return;
          } else if (!matchingUser.password) {
            // Establish password on first usage of password-less fallback
            matchingUser.password = password;
            localUsers[matchingUserIndex] = matchingUser;
            localStorage.setItem('milkshop_users', JSON.stringify(localUsers));
          }
          
          setSuccessMessage("Đăng nhập với quyền Admin thành công!");
          setTimeout(() => {
            onAuthSuccess(matchingUser);
            onClose();
          }, 1000);
        } else {
          // No local matching user yet, create local admin with the inputted password
          const adminProfile: UserProfile = {
            uid: "admin-fallback-uid-999",
            email: "nhuquynhalhp2005@gmail.com",
            displayName: "Như Quỳnh",
            role: "admin",
            phone: "0912678987",
            address: "Hải Phòng",
            createdAt: new Date().toISOString(),
            password: password // Established now!
          };
          
          localUsers.push(adminProfile);
          localStorage.setItem('milkshop_users', JSON.stringify(localUsers));

          setSuccessMessage("Đăng nhập với quyền Admin thành công!");
          setTimeout(() => {
            onAuthSuccess(adminProfile);
            onClose();
          }, 1000);
        }
      } else if (matchingUser) {
        if (matchingUser.password && matchingUser.password !== password) {
          setErrorMessage("Mật khẩu không chính xác. Vui lòng thử lại.");
          return;
        } else if (!matchingUser.password) {
          // Establish password on first usage
          matchingUser.password = password;
          localUsers[matchingUserIndex] = matchingUser;
          localStorage.setItem('milkshop_users', JSON.stringify(localUsers));
        }

        setSuccessMessage("Đăng nhập thành công!");
        setTimeout(() => {
          onAuthSuccess(matchingUser);
          onClose();
        }, 1000);
      } else {
        setErrorMessage("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Registration Email/Password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setErrorMessage("Tên hiển thị, email và mật khẩu không được trống.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không trùng khớp.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải dài tối thiểu 6 ký tự.");
      return;
    }
    setLoading(true);
    handleReset();
    try {
      let newProfile: UserProfile;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName });
        
        const isSystemAdmin = email.trim().toLowerCase() === 'nhuquynhalhp25@gmail.com' || email.trim().toLowerCase() === 'nhuquynhalhp2005@gmail.com';
        
        newProfile = {
          uid: user.uid,
          email: user.email || email,
          displayName,
          role: isSystemAdmin ? 'admin' : 'user',
          phone,
          address,
          createdAt: new Date().toISOString()
        };
        
        await saveUserProfile(newProfile);
      } catch (fbErr: any) {
        console.warn("Firebase Auth operation-not-allowed fallback: Registering locally...", fbErr);
        const isSystemAdmin = email.trim().toLowerCase() === 'nhuquynhalhp25@gmail.com' || email.trim().toLowerCase() === 'nhuquynhalhp2005@gmail.com';
        
        newProfile = {
          uid: "local-user-" + Date.now(),
          email: email,
          displayName,
          role: isSystemAdmin ? 'admin' : 'user',
          phone,
          address,
          createdAt: new Date().toISOString(),
          password: password
        };

        const localUsers = JSON.parse(localStorage.getItem('milkshop_users') || '[]');
        if (localUsers.some((u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase())) {
          throw new Error("Email đã tồn tại trên thiết bị này.");
        }
        localUsers.push(newProfile);
        localStorage.setItem('milkshop_users', JSON.stringify(localUsers));
      }

      setSuccessMessage("Đăng ký thành công!");
      setTimeout(() => {
        onAuthSuccess(newProfile);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Đăng ký tài khoản thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recover Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Vui lòng nhập Email để gửi liên kết khôi phục.");
      return;
    }
    setLoading(true);
    handleReset();
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.");
    } catch (err: any) {
      setErrorMessage("Gửi email khôi phục thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Trial Bypass Trigger
  const triggerDemoLogin = (role: 'admin' | 'user') => {
    setLoading(true);
    handleReset();
    const demoProfile: UserProfile = role === 'admin' ? {
      uid: "mock-admin-9999",
      email: "nhuquynhalhp2005@gmail.com", // Admin authority email
      displayName: "Như Quỳnh",
      role: "admin",
      phone: "0912345678",
      address: "Hà Nội, Việt Nam",
      createdAt: new Date().toISOString()
    } : {
      uid: "mock-user-5432",
      email: "khachhang_demo@gmail.com",
      displayName: "Thành Viên Thử Nghiệm",
      role: "user",
      phone: "0987654321",
      address: "123 Đường Sữa Mẹ, Quận 1, TP Hồ Chí Minh",
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setSuccessMessage(`Truy cập nhanh thành công với quyền: ${role.toUpperCase()}!`);
      setTimeout(() => {
        onAuthSuccess(demoProfile);
        onClose();
        setLoading(false);
      }, 1000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]">
        
        {/* Header background decoration */}
        <div className="bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-7 text-white relative">
          <button
            id="auth-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 text-white hover:bg-black/25 active:scale-95 transition-all text-sm font-semibold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-widest uppercase mb-1">
            HỘI VIÊN THIÊN ĐƯỜNG SỮA
          </span>
          <h3 className="text-xl font-black tracking-tight">
            {tab === 'login' ? 'Đăng Nhập Thành Viên' : tab === 'register' ? 'Đăng Ký Tài Khoản' : 'Khôi Phục Mật Khẩu'}
          </h3>
          <p className="text-xs text-sky-100 mt-1">
            {tab === 'login' 
              ? 'Vui lòng nhập Email và mật khẩu của bạn để tiếp tục.' 
              : tab === 'register' 
              ? 'Tạo tài khoản mới để lưu lịch sử mua sắm và nhận ưu đãi.' 
              : 'Chúng tôi sẽ gửi liên kết cài đặt lại mật khẩu vào email của bạn.'}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 animate-bounce" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Content depending on current active tab */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-500 uppercase">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@gmail.com"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 text-left font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-500 uppercase">Mật khẩu</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập tối thiểu 6 chữ số"
                    className="w-full pl-11 pr-11 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 text-left font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none p-1 rounded-md transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-sm shadow-md hover:shadow-lg active:scale-95 duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xác thực..." : "Đăng Nhập"}
              </button>

              {/* Google Sign-In Element Block */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-bold uppercase tracking-wider">Hoặc tiếp tục với</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <button
                type="button"
                id="auth-google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-stone-200 rounded-2xl bg-stone-50 text-stone-700 font-bold text-sm hover:bg-stone-100 active:scale-95 duration-250 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Chrome className="w-5 h-5 text-red-500 animate-pulse" />
                <span>Đăng nhập bằng Google</span>
              </button>

              {/* Direct register and forgot triggers underneath */}
              <div className="pt-3 border-t border-stone-100 flex flex-col items-center gap-2 text-xs">
                <button
                  type="button"
                  id="auth-link-register"
                  onClick={() => handleTabChange('register')}
                  className="font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
                <button
                  type="button"
                  id="auth-link-forgot"
                  onClick={() => handleTabChange('forgot')}
                  className="font-medium text-stone-450 hover:text-stone-600 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-500 uppercase">Tên hiển thị *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Như Quỳnh"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-500 uppercase">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912xxxxxx"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-500 uppercase">Địa chỉ Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@gmail.com"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-500 uppercase">Địa chỉ giao hàng</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ cụ thể của bạn"
                    rows={2}
                    className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-stone-500 uppercase">Mật khẩu *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-11 pr-11 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none p-1 rounded-md transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-stone-500 uppercase">Xác nhận lại *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-11 pr-11 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none p-1 rounded-md transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-sm shadow-md hover:shadow-lg active:scale-95 duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang đăng ký..." : "Đăng Ký"}
              </button>

              {/* Google Sign-Up Element Block */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-bold uppercase tracking-wider">Hoặc tiếp tục với</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <button
                type="button"
                id="auth-google-signup-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-stone-200 rounded-2xl bg-stone-50 text-stone-700 font-bold text-sm hover:bg-stone-100 active:scale-95 duration-250 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Chrome className="w-5 h-5 text-red-500" />
                <span>Đăng ký nhanh bằng Google</span>
              </button>

              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  id="auth-link-login-from-reg"
                  onClick={() => handleTabChange('login')}
                  className="font-extrabold text-blue-600 hover:text-blue-700 text-xs transition-colors"
                >
                  Đã có tài khoản? Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-500 uppercase">Địa chỉ Email tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@gmail.com"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-sm shadow-md hover:shadow-lg active:scale-95 duration-200 cursor-pointer"
              >
                {loading ? "Đang gửi liên kết..." : "Gửi Email Khôi Phục"}
              </button>

              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  id="auth-link-login-from-forgot"
                  onClick={() => handleTabChange('login')}
                  className="font-extrabold text-blue-600 hover:text-blue-700 text-xs transition-colors"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
