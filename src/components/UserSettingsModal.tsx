import React, { useState } from 'react';
import { X, User, Phone, MapPin, Lock, Check, Sparkles, Eye, EyeOff, Smile, Link2, RefreshCw, Upload } from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../firebase/dbService';
import { auth } from '../firebase/config';
import { updatePassword, updateProfile } from 'firebase/auth';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateSuccess: (updatedUser: UserProfile) => void;
}

// Pre-defined premium cute character avatars suitable for the milk shop
const AVATAR_PRESETS = [
  { name: "Cậu bé hiếu động", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop" },
  { name: "Cô bé đáng yêu", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop" },
  { name: "Dì dịu dàng", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop" },
  { name: "Bố khoẻ khoắn", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop" },
  { name: "Mẹ hiền hậu", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop" },
  { name: "Ông nội thông thái", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop" },
];

export default function UserSettingsModal({ isOpen, onClose, user, onUpdateSuccess }: UserSettingsModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Dung lượng ảnh tối đa là 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoURL(reader.result);
          setSuccessMessage("Đã tải ảnh lên thành công!");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      };
      reader.onerror = () => {
        setErrorMessage("Có lỗi xảy ra khi đọc file ảnh.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Additional validations
    if (!displayName.trim()) {
      setErrorMessage("Vui lòng điền tên hiển thị.");
      setLoading(false);
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Vui lòng điền số điện thoại.");
      setLoading(false);
      return;
    }
    if (!address.trim()) {
      setErrorMessage("Vui lòng điền địa chỉ nhận sữa.");
      setLoading(false);
      return;
    }

    // Validate password match if they types one
    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage("Mật khẩu mới phải từ 6 ký tự trở lên.");
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("Mật khẩu nhập lại không khớp.");
        setLoading(false);
        return;
      }
    }

    try {
      const updatedUser: UserProfile = {
        ...user,
        displayName,
        phone,
        address,
        photoURL,
      };

      if (newPassword) {
        updatedUser.password = newPassword;
      }

      // 1. Save to profile store (handles firestore sync & localStorage fallback)
      await saveUserProfile(updatedUser);

      // 2. If signed via Firebase Auth, update Firebase user profile as well
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await updateProfile(currentUser, {
            displayName,
            photoURL: photoURL || null
          });
          
          if (newPassword) {
            await updatePassword(currentUser, newPassword);
          }
        } catch (firebaseErr: any) {
          console.warn("Firebase Auth sub-update failed (possibly needs re-authentication):", firebaseErr);
          // Don't crash because we updated Firestore and localStorage successfully
        }
      }

      // 3. For custom local authentication sessions
      const demoSession = sessionStorage.getItem('milkshop_demo_user');
      if (demoSession) {
        sessionStorage.setItem('milkshop_demo_user', JSON.stringify(updatedUser));
      }

      // 4. Update also matching entry inside "milkshop_users" list
      try {
        const localUsers = JSON.parse(localStorage.getItem('milkshop_users') || '[]');
        const index = localUsers.findIndex((u: any) => u.uid === user.uid);
        if (index >= 0) {
          localUsers[index] = { ...localUsers[index], ...updatedUser };
          localStorage.setItem('milkshop_users', JSON.stringify(localUsers));
        }
      } catch (e) {}

      setSuccessMessage("Cập nhật thông tin tài khoản thành công!");
      
      // Update the React Parent State
      setTimeout(() => {
        onUpdateSuccess(updatedUser);
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Đã xảy ra lỗi khi cập nhật tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-150 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header Block with Elegant Blue Design */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md">TIỆN ÍCH HỘI VIÊN</span>
          </div>
          <h2 className="text-xl font-extrabold mt-1">Cài Đặt Tài Khoản</h2>
          <p className="text-xs text-sky-100 mt-1">Sửa đổi thông tin cá nhân, ảnh đại diện và mật khẩu bảo mật của bạn.</p>
        </div>

        {/* Scrollable Container Form */}
        <form onSubmit={handleUpdateProfile} className="flex-1 overflow-y-auto p-6 space-y-5 text-left text-stone-850">
          
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
              <span className="bg-red-100 p-1 rounded-lg text-red-600 font-bold font-mono">⚠️ Lỗi:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-pulse">
              <span className="bg-green-100 p-1 rounded-lg text-green-600">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Avatar Settings Block */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-stone-500 uppercase tracking-wider block">Chọn ảnh đại diện của bạn</label>
            
            {/* Curated Current Photo & Entry */}
            <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="relative">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt="Current Avatar" 
                    className="w-16 h-16 object-cover rounded-full border-2 border-primary-500 shadow-md"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-xl flex items-center justify-center uppercase shadow-md">
                    {displayName.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-1 rounded-full border border-white">
                  <Smile className="w-3.5 h-3.5" />
                </div>
              </div>
              
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="url"
                      value={photoURL.startsWith('data:') ? '' : photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="Dán đường dẫn ảnh ở đây..."
                      className="w-full pl-8 pr-3 py-1.8 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 bg-white"
                    />
                  </div>
                  
                  <label className="flex items-center gap-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 px-3 py-1.8 rounded-xl cursor-pointer transition-colors text-xs font-bold shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <p className="text-[10px] text-stone-400 leading-normal">Chọn ảnh từ máy tính/thư viện của bạn, dán link ảnh trực tuyến hoặc click chọn nhanh nhân vật bên dưới:</p>
              </div>
            </div>

            {/* Quick Presets Selection Grid */}
            <div className="grid grid-cols-6 gap-2 pt-1">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = photoURL === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setPhotoURL(preset.url)}
                    className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-primary-500 scale-105 shadow-md ring-2 ring-primary-100' : 'border-stone-200 hover:border-stone-400'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white stroke-[3px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Standard Information Settings Fields */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-widest block">Thông tin cơ bản</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 block">Tên hiển thị <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 font-bold text-stone-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 block">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-stone-800 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-500 block">Địa chỉ nhận sữa <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-stone-800"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Secure Password Update Fields */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-widest">Thay đổi mật khẩu tài khoản</h4>
              <span className="text-[9px] font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">Để trống nếu không muốn đổi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 block">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu từ 6 ký tự"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 block">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action trigger footer inside form */}
          <div className="flex gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl active:scale-[0.98] transition-all"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold rounded-2xl active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

