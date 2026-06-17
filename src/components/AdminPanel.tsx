import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, FolderSync, DollarSign, Package, ShoppingBag, 
  Users, Check, X, ShieldAlert, Sparkles, Filter, Search, Eye, Settings, FileText, Flame
} from 'lucide-react';
import { Product, Order, UserProfile, MilkCategory, SystemSettings, Slide, HomeCategorySetting } from '../types';
import { 
  addProduct, updateProduct, deleteProduct, 
  updateOrderStatus, updateUserRole, saveSystemSettings
} from '../firebase/dbService';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  users: UserProfile[];
  onRefreshData: () => void;
  settings: SystemSettings;
}

export default function AdminPanel({
  products,
  orders,
  users,
  onRefreshData,
  settings
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'products' | 'orders' | 'users' | 'settings'>('products');

  // ---------- GENERAL CONFIGURATION SETTINGS STATE ----------
  const [brandName, setBrandName] = useState(settings?.brandName || "Thiên Đường");
  const [logoChar, setLogoChar] = useState(settings?.logoChar || "T");
  const [brandSuffix, setBrandSuffix] = useState(settings?.brandSuffix || "SỮA");
  const [addressValue, setAddressValue] = useState(settings?.address || "");
  const [phoneValue, setPhoneValue] = useState(settings?.phone || "");
  const [emailValue, setEmailValue] = useState(settings?.email || "");
  const [footerTextVal, setFooterTextVal] = useState(settings?.footerText || "");

  // Slide state bindings
  const [slides, setSlides] = useState<Slide[]>(settings?.bannerSlides || []);

  // Homepage custom categories state bindings
  const [homeCategoryTitle, setHomeCategoryTitle] = useState(settings?.homeCategoryTitle || "Chọn sữa bột phù hợp lứa tuổi");
  const [homeCategorySubtitle, setHomeCategorySubtitle] = useState(settings?.homeCategorySubtitle || "Mỗi độ tuổi có một nhu cầu năng lượng riêng. Chọn đúng phân khúc sữa bột để hấp thu tối ưu nhất.");
  const [homeCategories, setHomeCategories] = useState<HomeCategorySetting[]>(
    settings?.homeCategories || [
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
  );

  // Flash Sale customization states
  const [flashSaleTitle, setFlashSaleTitle] = useState(settings?.flashSaleTitle || "CƠN LỐC FLASH SALE");
  const [flashSaleSubtitle, setFlashSaleSubtitle] = useState(settings?.flashSaleSubtitle || "Săn giá hời - Số lượng giới hạn dành riêng cho bé");
  const [flashSaleDiscount, setFlashSaleDiscount] = useState(settings?.flashSaleDiscount ?? 15);
  const [flashSaleDurationMinutes, setFlashSaleDurationMinutes] = useState(settings?.flashSaleDurationMinutes ?? 120);
  const [flashSaleProductIds, setFlashSaleProductIds] = useState<string[]>(settings?.flashSaleProductIds || []);

  // Sync state if settings prop changes (e.g. on load)
  useEffect(() => {
    if (settings) {
      setBrandName(settings.brandName);
      setLogoChar(settings.logoChar);
      setBrandSuffix(settings.brandSuffix);
      setAddressValue(settings.address);
      setPhoneValue(settings.phone);
      setEmailValue(settings.email);
      setFooterTextVal(settings.footerText);
      setSlides(settings.bannerSlides || []);
      setHomeCategoryTitle(settings.homeCategoryTitle || "Chọn sữa bột phù hợp lứa tuổi");
      setHomeCategorySubtitle(settings.homeCategorySubtitle || "Mỗi độ tuổi có một nhu cầu năng lượng riêng. Chọn đúng phân khúc sữa bột để hấp thu tối ưu nhất.");
      if (settings.homeCategories && settings.homeCategories.length > 0) {
        setHomeCategories(settings.homeCategories);
      }
      setFlashSaleTitle(settings.flashSaleTitle || "CƠN LỐC FLASH SALE");
      setFlashSaleSubtitle(settings.flashSaleSubtitle || "Săn giá hời - Số lượng giới hạn dành riêng cho bé");
      setFlashSaleDiscount(settings.flashSaleDiscount ?? 15);
      setFlashSaleDurationMinutes(settings.flashSaleDurationMinutes ?? 120);
      setFlashSaleProductIds(settings.flashSaleProductIds || []);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SystemSettings = {
      brandName,
      logoChar,
      brandSuffix,
      address: addressValue,
      phone: phoneValue,
      email: emailValue,
      footerText: footerTextVal,
      bannerSlides: slides,
      homeCategoryTitle,
      homeCategorySubtitle,
      homeCategories,
      flashSaleTitle,
      flashSaleSubtitle,
      flashSaleDiscount,
      flashSaleDurationMinutes,
      flashSaleProductIds
    };

    try {
      await saveSystemSettings(updatedSettings);
      alert("Cập nhật cấu hình website thành công!");
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu cấu hình.");
    }
  };

  const handleUpdateSlideField = (index: number, field: keyof Slide, val: any) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: val };
    setSlides(updated);
  };

  // ---------- PRODUCT CRUD STATE ----------
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodBrand, setProdBrand] = useState('Abbott');
  const [prodCategory, setProdCategory] = useState<MilkCategory>('children');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodStock, setProdStock] = useState(10);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodWeight, setProdWeight] = useState('900g / Lon');

  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // ---------- STATISTICAL CALCULATING ----------
  const totalRevenue = orders
    .filter((o) => o.status === 'Delivered')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Set values for edit mode
  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdBrand(p.brand);
    setProdCategory(p.category);
    setProdDescription(p.description);
    setProdImageUrl(p.imageUrl);
    setProdStock(p.stock);
    setProdFeatured(p.featured);
    setProdIsNew(p.isNew);
    setProdWeight(p.weight || '900g / Lon');
    setShowProductForm(true);
  };

  const handleClearProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice(0);
    setProdBrand('Abbott');
    setProdCategory('children');
    setProdDescription('');
    setProdImageUrl('');
    setProdStock(10);
    setProdFeatured(false);
    setProdIsNew(true);
    setProdWeight('900g / Lon');
    setShowProductForm(false);
  };

  // Submit product creation or update
  const onSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || prodPrice <= 0 || prodStock < 0 || !prodImageUrl) {
      alert("Vui lòng điền đầy đủ các trường thông tin hợp lệ!");
      return;
    }

    const payload: Omit<Product, 'id'> = {
      name: prodName,
      price: Number(prodPrice),
      brand: prodBrand,
      category: prodCategory,
      description: prodDescription,
      imageUrl: prodImageUrl,
      stock: Number(prodStock),
      featured: prodFeatured,
      isNew: prodIsNew,
      weight: prodWeight,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, { ...payload, id: editingProduct.id });
        alert("Cập nhật sữa bột thành công!");
      } else {
        await addProduct(payload);
        alert("Đã thêm sữa bột chính hãng vào kệ!");
      }
      handleClearProductForm();
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu sản phẩm. Xem nhật ký console.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Bạn chắn chắn muốn xóa mặt hàng sữa này khỏi kệ chứ?\n[${name}]`)) {
      try {
        await deleteProduct(id);
        alert("Đã xóa hoàn toàn sản phẩm.");
        onRefreshData();
      } catch (err) {
        console.error(err);
        alert("Lỗi xóa sản phẩm.");
      }
    }
  };

  // ---------- ORDER STATUS CHANGE ----------
  const handleChangeOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`Đã cập nhật trạng thái đơn hàng thành: ${newStatus}`);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật trạng thái.");
    }
  };

  // ---------- USER ROLE CONTROLS ----------
  const handleToggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`Bạn có chắc chắn muốn thay đổi chức vụ của thành viên này thành: ${targetRole.toUpperCase()} chứ?`)) {
      try {
        await updateUserRole(userId, targetRole);
        alert("Cập nhật quyền hạn thành viên thành công!");
        onRefreshData();
      } catch (err) {
        console.error(err);
        alert("Lỗi đổi quyền thành viên.");
      }
    }
  };

  // Filter lists based on sub search panels
  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
    p.brand.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => 
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.phone.includes(orderSearch) ||
    o.id?.includes(orderSearch)
  );

  const filteredUsers = users.filter((u) => 
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Confirmed': return 'bg-sky-100 text-sky-800 border border-sky-200';
      case 'Shipping': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-stone-150 text-stone-700';
    }
  };

  const translateStatus = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'Chờ duyệt';
      case 'Confirmed': return 'Đã xác nhận';
      case 'Shipping': return 'Đang giao hàng';
      case 'Delivered': return 'Đã giao (Thành công)';
      case 'Cancelled': return 'Đã huỷ bỏ';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* High-Level statistics cards metrics banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 bg-white rounded-3xl border border-stone-150 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Tổng Doanh Thu</span>
            <span className="text-xl font-extrabold text-stone-850 font-mono">
              {totalRevenue.toLocaleString()}đ
            </span>
            <p className="text-[10px] text-emerald-650 font-semibold">Tích luỹ sữa đã giao thành công</p>
          </div>
          <div className="p-3 rounded-full bg-emerald-50 text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-150 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Sách Hàng Sữa Bột</span>
            <span className="text-xl font-extrabold text-stone-850 font-mono">{products.length} hộp</span>
            <p className="text-[10px] text-stone-400 font-semibold">{outOfStockCount} loại đang cháy kệ</p>
          </div>
          <div className="p-3 rounded-full bg-blue-50 text-blue-500">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-150 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Tổng số Đơn hàng</span>
            <span className="text-xl font-extrabold text-stone-850 font-mono">{orders.length} đơn</span>
            <p className="text-[10px] text-amber-500 font-bold">{pendingOrdersCount} đơn đang đợi duyệt</p>
          </div>
          <div className="p-3 rounded-full bg-amber-50 text-amber-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-150 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Khách hàng đăng ký</span>
            <span className="text-xl font-extrabold text-stone-850 font-mono">{users.length} người</span>
            <p className="text-[10px] text-stone-400 font-semibold">Thành viên và Admin</p>
          </div>
          <div className="p-3 rounded-full bg-stone-50 text-stone-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Primary inner navigation tabs row */}
      <div className="flex border-b border-stone-200 text-sm font-semibold text-stone-500 p-1 bg-stone-100 rounded-2xl w-fit flex-wrap gap-1">
        <button
          id="admin-tab-prods"
          onClick={() => setAdminTab('products')}
          className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            adminTab === 'products' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-850'
          }`}
        >
          Hàng Sữa Trên Kệ
        </button>
        <button
          id="admin-tab-orders"
          onClick={() => setAdminTab('orders')}
          className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            adminTab === 'orders' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-850'
          }`}
        >
          Doanh Số & Đơn Hàng
        </button>
        <button
          id="admin-tab-users"
          onClick={() => setAdminTab('users')}
          className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            adminTab === 'users' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-850'
          }`}
        >
          Thành Viên & Quản Trị
        </button>
        <button
          id="admin-tab-settings"
          onClick={() => setAdminTab('settings')}
          className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            adminTab === 'settings' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-850'
          }`}
        >
          🎯 Cài Đặt Website
        </button>
      </div>

      {/* Subdivisions elements */}

      {/* Tab A: Products Catalog Administration with add and edit */}
      {adminTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-5 rounded-3xl border border-stone-100 shadow-xs">
            {/* Table Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Tìm sữa trong danh mục quản lý..."
                className="w-full pl-11 pr-4 py-2.5 text-xs rounded-2xl border border-stone-200 outline-none text-left"
              />
            </div>

            <button
              id="admin-add-prod-btn"
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(!showProductForm);
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-450 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>{showProductForm && !editingProduct ? "Đóng Form thêm mới" : "Thêm Hộp Sữa Mới"}</span>
            </button>
          </div>

          {/* Collapsible edit/add product form */}
          {showProductForm && (
            <form onSubmit={onSubmitProduct} className="p-6 bg-white rounded-3xl border border-stone-150 shadow-sm space-y-4 animate-fade-in relative">
              <h4 className="text-sm font-bold text-stone-800 pb-3 border-b border-stone-100 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{editingProduct ? `Cập Nhật dưỡng chất: ${editingProduct.name}` : "Tuyên bố sữa bột mới chính hãng"}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Tên sữa bột *</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Sữa bột Abbott Ensure Vani 900g"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 text-left"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Giá bán lẻ (VND) *</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    placeholder="780000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-mono text-left"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Hãng sản xuất *</label>
                  <input
                    type="text"
                    list="brands-datalist"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="Nhập hoặc chọn hãng sản xuất (ví dụ: Abbott, Vinamilk...)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 outline-none text-left bg-white font-medium"
                    required
                  />
                  <datalist id="brands-datalist">
                    <option value="Abbott" />
                    <option value="Meiji" />
                    <option value="Vinamilk" />
                    <option value="Anlene" />
                    <option value="Friso" />
                    <option value="Nutifood" />
                    <option value="Aptamil" />
                    <option value="Nestlé" />
                    <option value="TH true MILK" />
                    <option value="Enfamil" />
                    <option value="Similac" />
                    <option value="Hikid" />
                    <option value="ColosBaby" />
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Độ tuổi / Phân loại dinh dưỡng *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as MilkCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="children">children (Trẻ em)</option>
                    <option value="adults">adults (Người lớn)</option>
                    <option value="seniors">seniors (Người cao tuổi)</option>
                    <option value="pregnant">pregnant (Bà mẹ mang thai)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Số hộp có trên tủ quầy *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-mono text-left"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Khối lượng / Lon *</label>
                  <input
                    type="text"
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    placeholder="900g / Lon"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 text-left"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Ảnh Lon Sữa (URL) *</label>
                  <input
                    type="url"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com or server file path"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 text-left"
                    required
                  />
                </div>

              </div>

              {/* Description nutrition inputs */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Tính chất dưỡng chất, thành phần (Mô tả chi tiết)</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Hệ hạt ngũ cốc bổ sung canxi và canxi hữu cơ dưỡng ẩm tăng cao vượt bậc..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 text-left"
                />
              </div>

              {/* Checkbox markers tag row */}
              <div className="flex gap-6 text-xs font-semibold p-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="rounded border-stone-300 w-4.5 h-4.5 text-primary-500"
                  />
                  <span>🌟 Treo huy hiệu Bán Chạy / Nổi bật</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsNew}
                    onChange={(e) => setProdIsNew(e.target.checked)}
                    className="rounded border-stone-300 w-4.5 h-4.5 text-primary-500"
                  />
                  <span>📦 Gắn tag Hộp Sữa Mới nhập khẩu</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleClearProductForm}
                  className="px-4 py-2 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition-all"
                >
                  {editingProduct ? "Lưu thay đổi" : "Kích hoạt đưa lên kệ"}
                </button>
              </div>

            </form>
          )}

          {/* Table list of products */}
          <div className="bg-white rounded-3xl border border-stone-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 text-stone-500 uppercase font-black border-b border-stone-100">
                  <tr>
                    <th className="p-4 pl-6">Sản phẩm lon</th>
                    <th className="p-4">Hãng</th>
                    <th className="p-4">Nhóm đối tượng</th>
                    <th className="p-4">Giá bán lẻ</th>
                    <th className="p-4">Hộp trên quầy</th>
                    <th className="p-4">Đặc điểm nổi bật</th>
                    <th className="p-4 text-center pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 object-contain bg-stone-50 rounded-lg p-0.5 border"
                        />
                        <span className="font-bold text-stone-800 line-clamp-1 max-w-xs">{p.name}</span>
                      </td>
                      <td className="p-4 text-stone-600 font-bold">{p.brand}</td>
                      <td className="p-4 text-stone-500 text-[11px] capitalize">{p.category}</td>
                      <td className="p-4 font-mono font-bold text-stone-800">
                        {p.price.toLocaleString()}đ
                      </td>
                      <td className="p-4 font-mono">
                        {p.stock === 0 ? (
                          <span className="text-red-500 font-extrabold bg-red-50 px-2 py-0.5 rounded border border-red-100">Hết hàng</span>
                        ) : (
                          <span className="font-bold text-stone-700">{p.stock} hộp</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {p.isNew && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded">Mới</span>}
                          {p.featured && <span className="bg-amber-50 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded">Hot</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                            title="Sửa sữa bột"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id!, p.name)}
                            className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-stone-400">Không có sữa bột khớp với tìm kiếm của bạn</div>
            )}
          </div>
        </div>
      )}

      {/* Tab B: Orders & Subtotal Management */}
      {adminTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-xs flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Tìm đơn hàng theo tên khác hàng, điện thoại, mã đơn..."
                className="w-full pl-11 pr-4 py-2.5 text-xs rounded-2xl border border-stone-200 outline-none text-left"
              />
            </div>
            
            <button
              onClick={onRefreshData}
              className="p-2.5 text-stone-500 hover:bg-stone-50 border rounded-2xl flex items-center gap-1 text-xs font-bold cursor-pointer transition-all"
            >
              <FolderSync className="w-4.5 h-4.5" /> Đồng bộ dữ liệu mới
            </button>
          </div>

          {/* Orders detail list */}
          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                className="p-6 bg-white border border-stone-150 rounded-3xl shadow-xs text-xs space-y-4 text-stone-750"
              >
                {/* Header title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3.5 border-b border-stone-100">
                  <div>
                    <span className="font-mono text-[10px] text-stone-400 font-bold uppercase">
                      Mã Đơn Sữa: #{o.id?.substring(0, 10).toUpperCase() || 'LOCAL'}
                    </span>
                    <h4 className="text-sm font-bold text-stone-850 mt-0.5">
                      Khách hàng: {o.customerName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${getStatusBadge(o.status)}`}>
                      {translateStatus(o.status)}
                    </span>
                    
                    <span className="text-stone-400 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Shipping locations contact summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                  <div>
                    <span className="font-bold text-stone-400 block mb-1">Số điện thoại liên lạc</span>
                    <span className="text-stone-800 font-semibold">{o.phone}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-400 block mb-1">Hòm thư Email</span>
                    <span className="text-stone-800 font-semibold truncate block">{o.email}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-400 block mb-1">Điểm nhận sữa chính</span>
                    <span className="text-stone-800 font-semibold">{o.address}</span>
                  </div>
                </div>

                {/* Items collection table inside order */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-400 block">Sản phẩm bao gồm ({o.items ? o.items.length : 0} loại):</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {o.items?.map((it, index) => (
                      <div key={index} className="flex justify-between items-center bg-stone-50/20 p-2.5 rounded-xl border border-stone-100">
                        <div className="flex items-center gap-2.5">
                          <img src={it.imageUrl} className="w-7 h-7 object-contain bg-white rounded border" alt="" />
                          <span className="font-bold text-stone-700">{it.name}</span>
                        </div>
                        <div className="font-mono flex items-center gap-3">
                          <span className="text-stone-400">Số lượng: {it.quantity}</span>
                          <span className="font-bold text-stone-800">{(it.price * it.quantity).toLocaleString()}đ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Upgrade Controls Row */}
                <div className="pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-400 font-bold">Thanh Toán (Bao gồm VAT & Ship):</span>
                    <span className="text-lg font-black text-amber-500 font-mono">
                      {o.total.toLocaleString()}đ
                    </span>
                    <span className="text-[10px] text-stone-400">({o.paymentMethod})</span>
                  </div>

                  {/* Actions state buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {o.status === 'Pending' && (
                      <button
                        onClick={() => handleChangeOrderStatus(o.id!, 'Confirmed')}
                        className="py-1.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        ✓ Xác Nhận đơn sữa
                      </button>
                    )}
                    {o.status === 'Confirmed' && (
                      <button
                        onClick={() => handleChangeOrderStatus(o.id!, 'Shipping')}
                        className="py-1.5 px-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        🚚 Xuất lốp Giao hàng
                      </button>
                    )}
                    {o.status === 'Shipping' && (
                      <button
                        onClick={() => handleChangeOrderStatus(o.id!, 'Delivered')}
                        className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg cursor-pointer animate-pulse"
                      >
                        ✓ Đã Giao Thành Công
                      </button>
                    )}
                    {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleChangeOrderStatus(o.id!, 'Cancelled')}
                        className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-650 font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        ✕ Huỷ đơn sữa bỏ
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center text-stone-400 bg-white border rounded-3xl">Hệ thống chưa có đơn hàng nào khớp tìm kiếm</div>
            )}
          </div>
        </div>
      )}

      {/* Tab C: Customer/Users profile logs and role toggling */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-xs">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm thành viên theo tên hoặc email..."
                className="w-full pl-11 pr-4 py-2.5 text-xs rounded-2xl border border-stone-200 outline-none text-left"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 text-stone-500 uppercase font-black border-b border-stone-100">
                  <tr>
                    <th className="p-4 pl-6">Thành viên</th>
                    <th className="p-4">Email liên lạc</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4">Địa chỉ giao</th>
                    <th className="p-4">Cấp bậc quyền hạn</th>
                    <th className="p-4 text-center pr-6">Thay đổi quyền bộ máy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-stone-50/50">
                      <td className="p-4 pl-6 font-bold text-stone-850 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white flex items-center justify-center font-extrabold text-[11px] uppercase">
                          {u.displayName.charAt(0)}
                        </div>
                        <span>{u.displayName}</span>
                      </td>
                      <td className="p-4 text-stone-600 font-semibold">{u.email}</td>
                      <td className="p-4 text-stone-600 font-mono">{u.phone || 'Chưa cung cấp'}</td>
                      <td className="p-4 text-stone-500 truncate max-w-xs">{u.address || 'Chưa cung cấp'}</td>
                      <td className="p-4">
                        {u.role === 'admin' ? (
                          <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">👑 Admin</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">Thành Viên</span>
                        )}
                      </td>
                      <td className="p-4 text-center pr-6">
                        {u.email === 'nhuquynhalhp2005@gmail.com' ? (
                          <span className="text-[10px] text-stone-400">Admin mặc định</span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserRole(u.uid, u.role)}
                            className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-850 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                          >
                            {u.role === 'admin' ? "Bãi nhiệm Admin" : "Ủy quyền Admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-stone-400">Chưa có người dùng nào khớp trong hồ sơ</div>
            )}
          </div>
        </div>
      )}

      {/* Tab D: Configuration settings block */}
      {adminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8 animate-fade-in text-left">
          
          <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-stone-850 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-stone-100">
              <Settings className="w-5 h-5 text-indigo-500" />
              <span>Cấu hình Thương Hiệu & Đầu mối Liên Hệ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 text-left md:col-span-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Biểu tượng / Logo dễ thương</span>
                  <span className="text-red-500 font-extrabold text-[10px] lowercase animate-pulse">(Hot 🍼)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    value={logoChar}
                    onChange={(e) => setLogoChar(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 outline-none font-bold text-center focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-amber-50/10"
                    placeholder="Nhập chữ hoặc dán emoji..."
                  />
                </div>
                {/* Cute Presets select click row */}
                <div className="flex flex-wrap gap-1.5 pt-1.5 justify-center">
                  {[
                    { char: "☁️", label: "Đám mây bồng bềnh" },
                    { char: "💧", label: "Giọt nước tinh khiết" },
                    { char: "🍼", label: "Bình sữa" },
                    { char: "👶", label: "Em bé" },
                    { char: "🧸", label: "Gấu bông" },
                    { char: "🐮", label: "Bò sữa" },
                    { char: "🥛", label: "Ly sữa" },
                    { char: "✨", label: "Lấp lánh" }
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.char}
                      onClick={() => setLogoChar(preset.char)}
                      title={preset.label}
                      className={`text-sm px-2 py-1 rounded-lg border transition-all hover:scale-115 active:scale-95 cursor-pointer ${
                        logoChar === preset.char
                          ? "bg-amber-100 border-amber-400 text-amber-900 shadow-3xs scale-105 font-bold"
                          : "bg-stone-50 border-stone-150 text-stone-700 hover:bg-white"
                      }`}
                    >
                      {preset.char}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Tên Thương Hiệu Chính</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-bold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  placeholder="Ví dụ: THIÊN ĐƯỜNG"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Từ Khóa Hậu Tố (Suffix)</label>
                <input
                  type="text"
                  value={brandSuffix}
                  onChange={(e) => setBrandSuffix(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-bold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  placeholder="Ví dụ: SỮA, MILK"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Địa Chỉ Trụ Sở</label>
                <input
                  type="text"
                  value={addressValue}
                  onChange={(e) => setAddressValue(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  placeholder="Ví dụ: Cẩm Văn, An Quang, Hải Phòng"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Số Điện Thoại Hotline</label>
                <input
                  type="text"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-mono focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  placeholder="Ví dụ: 1900.8198"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Email Liên Hệ</label>
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-mono focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  placeholder="Ví dụ: support@domain.com"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Dòng chữ Chân Trang (Footer Copyright text)</label>
              <textarea
                rows={2}
                value={footerTextVal}
                onChange={(e) => setFooterTextVal(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
                placeholder="Dòng chữ bản quyền dưới đáy trang"
              />
            </div>
          </div>

          {/* 4 Premium Category Cards Manager */}
          <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-stone-850 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <span>Quản Lý 4 Phân Khúc / Lứa Tuổi Trang Chủ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Tiêu Đề Lớn Phần Lứa Tuổi</label>
                <input
                  type="text"
                  value={homeCategoryTitle}
                  onChange={(e) => setHomeCategoryTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-bold focus:border-sky-450 focus:ring-1 focus:ring-sky-450 text-stone-800"
                  placeholder="Chọn sữa bột phù hợp lứa tuổi"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Mô tả phụ nhỏ sau tiêu đề</label>
                <input
                  type="text"
                  value={homeCategorySubtitle}
                  onChange={(e) => setHomeCategorySubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-sky-450 focus:ring-1 focus:ring-sky-450 text-stone-800"
                  placeholder="Mô tả phụ cho mục phân khúc tuổi..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3">
              {homeCategories.map((cat, idx) => {
                let friendlyCategory = "Trẻ em (children)";
                if (cat.key === 'adults') friendlyCategory = "Người trưởng thành (adults)";
                if (cat.key === 'seniors') friendlyCategory = "Người lớn tuổi (seniors)";
                if (cat.key === 'pregnant') friendlyCategory = "Mẹ bầu dưỡng thai (pregnant)";

                const handleFieldChange = (field: keyof HomeCategorySetting, val: string) => {
                  const updated = [...homeCategories];
                  updated[idx] = { ...updated[idx], [field]: val };
                  setHomeCategories(updated);
                };

                return (
                  <div key={cat.key} className="p-5 rounded-3xl border border-stone-150 bg-stone-50/40 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                      <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest bg-stone-200/50 px-2 py-0.5 rounded-lg border border-stone-300/30">
                        {friendlyCategory}
                      </span>
                      <span className="text-[9px] font-bold text-stone-400 font-mono uppercase">Key: {cat.key}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tiêu đề Thẻ</label>
                        <input
                          type="text"
                          value={cat.title}
                          onChange={(e) => handleFieldChange('title', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 bg-white outline-none focus:border-sky-400 text-stone-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tiêu đề Phụ / Slogan</label>
                        <input
                          type="text"
                          value={cat.subtitle}
                          onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white outline-none focus:border-sky-400 text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mô tả chi tiết</label>
                      <textarea
                        rows={2}
                        value={cat.desc}
                        onChange={(e) => handleFieldChange('desc', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white outline-none focus:border-sky-400 resize-none text-stone-850 leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Đường dẫn hình ảnh (icon vuông)</label>
                      <input
                        type="text"
                        value={cat.image}
                        onChange={(e) => handleFieldChange('image', e.target.value)}
                        className="w-full px-3 py-2 text-[11px] rounded-lg border border-stone-200 bg-white outline-none focus:border-sky-400 font-mono text-stone-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CẤU HÌNH CƠN LỐC FLASH SALE */}
          <div className="p-6 rounded-3.5xl border border-red-150 bg-red-50/20 space-y-6">
            <h3 className="text-sm font-black text-stone-850 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-red-200/50">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <span>Cài Đặt "Cơn Lốc Flash Sale" Giờ Vàng</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Tiêu Đề Flash Sale</label>
                <input
                  type="text"
                  value={flashSaleTitle}
                  onChange={(e) => setFlashSaleTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-bold focus:border-red-450 focus:ring-1 focus:ring-red-450 text-stone-800 bg-white"
                  placeholder="CƠN LỐC FLASH SALE"
                />
              </div>

              <div className="space-y-1.5 text-left md:col-span-2">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Mô tả phụ ngắn</label>
                <input
                  type="text"
                  value={flashSaleSubtitle}
                  onChange={(e) => setFlashSaleSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-red-450 focus:ring-1 focus:ring-red-450 text-stone-800 bg-white"
                  placeholder="Săn giá hời - Số lượng giới hạn dành riêng cho bé"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">% Giảm giá (% Off)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={flashSaleDiscount}
                    onChange={(e) => setFlashSaleDiscount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-mono focus:border-red-450 focus:ring-1 focus:ring-red-450 text-stone-800 bg-white text-center"
                    placeholder="15"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Số phút đếm ngược</label>
                  <input
                    type="number"
                    min={1}
                    value={flashSaleDurationMinutes}
                    onChange={(e) => setFlashSaleDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 outline-none font-mono focus:border-red-450 focus:ring-1 focus:ring-red-450 text-stone-800 bg-white text-center"
                    placeholder="120"
                  />
                </div>
              </div>
            </div>

            {/* Product selection list grid */}
            <div className="space-y-2 text-left bg-white p-5 rounded-3xl border border-red-100/50">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Lựa Chọn Sản Phẩm Khuyến Mãi Flash Sale:
              </span>
              <p className="text-[11px] text-stone-450 leading-relaxed font-medium">
                Hãy tích chọn các hộp sữa bột bạn muốn đính kèm trong mục Flash Sale đặc biệt trên Trang chủ. Nếu chưa tích chọn sản phẩm riêng nào, hệ thống sẽ tự động hiển thị 3 sản phẩm đầu tiên từ tủ kệ sữa của bạn để đảm bảo giao diện luôn được lấp đầy.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 max-h-64 overflow-y-auto pr-1">
                {products.map((p) => {
                  const isChecked = flashSaleProductIds.includes(p.id || "");
                  const toggleProduct = () => {
                    if (isChecked) {
                      setFlashSaleProductIds(flashSaleProductIds.filter(id => id !== p.id));
                    } else {
                      setFlashSaleProductIds([...flashSaleProductIds, p.id || ""]);
                    }
                  };
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={toggleProduct}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all hover:bg-neutral-50/60 cursor-pointer ${
                        isChecked 
                          ? 'border-red-400 bg-red-100/10 shadow-3xs text-red-950 font-bold' 
                          : 'border-stone-200 text-stone-700 bg-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isChecked ? 'bg-red-500 border-red-500 text-white' : 'border-stone-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      
                      <img src={p.imageUrl} alt={p.name} className="w-9 h-9 object-contain rounded-xl bg-stone-50" referrerPolicy="no-referrer" />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs truncate font-extrabold leading-tight text-neutral-800">{p.name}</h4>
                        <span className="text-[9px] uppercase tracking-wider block text-stone-400 mt-0.5 font-bold">
                          {p.brand} • {p.weight || "900g / Lon"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Slide list manager panels */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-stone-850 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-stone-200">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Quản Lý Banners Quảng Cáo Trang Chủ ({slides.length} Banners)</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {slides.map((slide, idx) => (
                <div key={slide.id} className="bg-white p-5 rounded-3xl border border-stone-150 shadow-xs space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider">Quảng Cáo #{idx + 1}</span>
                    <span className="text-[9px] font-bold text-stone-400 font-mono">ID: {slide.id}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tiêu đề phụ (Badge)</label>
                      <input
                        type="text"
                        value={slide.badge}
                        onChange={(e) => handleUpdateSlideField(idx, 'badge', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tiêu đề chính (Title)</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateSlideField(idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mô tả phụ (Subtitle)</label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => handleUpdateSlideField(idx, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Đoạn văn ngắn chi tiết</label>
                      <textarea
                        rows={3}
                        value={slide.description}
                        onChange={(e) => handleUpdateSlideField(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nút hành động (Button Text)</label>
                      <input
                        type="text"
                        value={slide.buttonText}
                        onChange={(e) => handleUpdateSlideField(idx, 'buttonText', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Đường dẫn ảnh bìa (Image URL)</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => handleUpdateSlideField(idx, 'image', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono truncate"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              id="admin-btn-save-settings"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg active:scale-95 hover:shadow-xl transition-all cursor-pointer"
            >
              Lưu toàn bộ Cài đặt thiết lập
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
