import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Plus, ShieldCheck, Heart, ArrowUpDown, CornerDownLeft, Eye } from 'lucide-react';
import { Product, MilkCategory } from '../types';

interface ShopViewProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  initialCategoryFilter?: string;
  onClearInitialCategoryFilter?: () => void;
}

export default function ShopView({ products, onAddToCart, initialCategoryFilter, onClearInitialCategoryFilter }: ShopViewProps) {
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter || 'all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  useEffect(() => {
    if (initialCategoryFilter && initialCategoryFilter !== 'all') {
      setCategoryFilter(initialCategoryFilter);
      if (onClearInitialCategoryFilter) {
        onClearInitialCategoryFilter();
      }
    }
  }, [initialCategoryFilter]);

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Convert category constant to Vietnamese label
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'children': return 'Trẻ sơ sinh & Trẻ nhỏ';
      case 'adults': return 'Người trưởng thành';
      case 'seniors': return 'Người trung niên & Người cao tuổi';
      case 'pregnant': return 'Mẹ bầu dưỡng thai';
      default: return cat;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'children': return 'bg-sky-50 text-sky-600 border border-sky-100';
      case 'adults': return 'bg-teal-50 text-teal-600 border border-teal-100';
      case 'seniors': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'pregnant': return 'bg-pink-50 text-pink-600 border border-pink-100';
      default: return 'bg-stone-50 text-stone-600 border border-stone-200';
    }
  };

  // Brands present in initial state - derived dynamically
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();
  const brands = ['all', ...uniqueBrands];

  // Handle Filtering core logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    
    const matchesBrand = brandFilter === 'all' || p.brand.toLowerCase() === brandFilter.toLowerCase();
    
    let matchesPrice = true;
    if (priceFilter === 'under400') matchesPrice = p.price < 400000;
    else if (priceFilter === '400to700') matchesPrice = p.price >= 400000 && p.price <= 700000;
    else if (priceFilter === 'over700') matchesPrice = p.price > 700000;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  // Handle Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'nameAlpha') return a.name.localeCompare(b.name);
    return 0; // Default or new arrival sorted naturally
  });

  // Handlers
  const handleQuickAdd = (p: Product) => {
    onAddToCart(p, 1);
    setShowToast(p.name);
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleDetailAdd = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, detailQty);
      const name = selectedProduct.name;
      setSelectedProduct(null);
      setDetailQty(1);
      setShowToast(name);
      setTimeout(() => setShowToast(null), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast alert confirmation */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
          <div className="text-xs font-semibold">
            Có <span className="text-amber-400">1 hộp</span> {showToast} đã được thêm vào giỏ!
          </div>
        </div>
      )}

      {/* Modern Filter controls panel */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-stone-850">
            <SlidersHorizontal className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-bold">Bộ lọc sản phẩm dinh dưỡng</h3>
          </div>
          
          {/* Main search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm dòng sữa, thương hiệu..."
              className="w-full pl-11 pr-4 py-2.5 text-xs rounded-2xl border border-stone-200 outline-none focus:border-primary-500 bg-stone-50 text-left"
            />
          </div>
        </div>

        {/* Categories selectors pillbar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400 self-center mr-2 uppercase">Danh mục:</span>
          {[
            { id: 'all', label: 'Tất cả sữa bột' },
            { id: 'children', label: 'Sữa Cho Bé' },
            { id: 'adults', label: 'Sữa Cho Người Lớn' },
            { id: 'seniors', label: 'Sữa Người Cao Tuổi' },
            { id: 'pregnant', label: 'Sữa Cho Mẹ Bầu' }
          ].map((cat) => (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all cursor-pointer border ${
                categoryFilter === cat.id
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-transparent shadow-sm'
                  : 'bg-stone-50 text-stone-600 border-stone-200/50 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary filters dropdown row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
          
          {/* Brand select */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-stone-400 uppercase">Hãng sản xuất</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-200 bg-white capitalize"
            >
              <option value="all">Tất cả thương hiệu nổi bật ({uniqueBrands.length})</option>
              {uniqueBrands.map((brandName) => (
                <option key={brandName} value={brandName}>{brandName}</option>
              ))}
            </select>
          </div>

          {/* Price Range select */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-stone-400 uppercase">Khoảng Giá Sữa</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-200 bg-white"
            >
              <option value="all">Mọi mức giá cả</option>
              <option value="under400">Dưới 400.000đ / Hộp</option>
              <option value="400to700">Từ 400.000đ - 700.000đ</option>
              <option value="over700">Trên 700.000đ / Hộp cao cấp</option>
            </select>
          </div>

          {/* Sorting selects */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-stone-400 uppercase">Sắp xếp theo thứ tự</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-200 bg-white"
            >
              <option value="default">Mặc định (Tin mới nhất)</option>
              <option value="priceAsc">Mức giá: Thấp đến Cao</option>
              <option value="priceDesc">Mức giá: Cao xuống Thấp</option>
              <option value="nameAlpha">Tên chữ cái (A - Z)</option>
            </select>
          </div>

        </div>

        {/* Results Counter */}
        <div className="text-stone-400 font-mono text-[11px] pt-2 flex items-center justify-between">
          <span>Tìm thấy {sortedProducts.length} loại sữa bột phù hợp tiêu chí</span>
          {searchTerm && <button onClick={() => setSearchTerm('')} className="text-primary-500 font-semibold hover:underline">Xóa ô tìm kiếm</button>}
        </div>
      </div>

      {/* Main Grid display products */}
      {sortedProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-150 shadow-xs">
          <CornerDownLeft className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h4 className="text-lg font-bold text-stone-800">Không tìm thấy sản phẩm sữa bột cần tìm</h4>
          <p className="text-sm text-stone-400 max-w-sm mx-auto mt-1">Xin lỗi, hệ thống của chúng tôi hiện chưa có mặt hàng sữa bột này, vui lòng chỉnh lại bộ lọc tìm kiếm!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-3xl border border-stone-150 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image card banner */}
                <div className="h-52 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3">
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-15">
                    {p.isNew && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-extrabold shadow-sm uppercase tracking-wide">
                        Mới
                      </span>
                    )}
                    {p.featured && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-extrabold shadow-sm uppercase tracking-wide">
                        Nổi bật
                      </span>
                    )}
                  </div>
                  
                  {/* Category label absolute container */}
                  <span className={`absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[9px] font-bold ${getCategoryBadgeClass(p.category)}`}>
                    {p.brand}
                  </span>

                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain rounded-2xl group-hover:scale-106 duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Hover Quick view overlay inside core grid */}
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity scale-98 rounded-3xl p-4 gap-2 z-10">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="px-4 py-2 bg-white rounded-xl text-stone-800 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 hover:bg-stone-50"
                    >
                      <Eye className="w-3.5 h-3.5" /> Thuyết minh dinh dưỡng
                    </button>
                  </div>
                </div>

                {/* Info Text block */}
                <div className="p-5 text-left space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none block">
                    {getCategoryLabel(p.category)}
                  </span>
                  
                  <h4 
                    onClick={() => setSelectedProduct(p)}
                    className="text-sm font-bold text-stone-800 leading-snug line-clamp-2 hover:text-primary-600 transition-colors pointer-events-auto cursor-pointer h-10"
                    title={p.name}
                  >
                    {p.name}
                  </h4>

                  {/* Specifications and seals */}
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hãng sữa {p.brand}</span>
                  </div>
                </div>
              </div>

              {/* Price and Add button area */}
              <div className="p-5 pt-0 text-left border-t border-stone-50/50 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-stone-350 block leading-none mb-1">{p.weight || "Mỗi Hộp can 900g"}</span>
                  <span className="text-base font-extrabold text-amber-500 font-mono">
                    {p.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {p.stock > 0 ? (
                  <button
                    id={`quick-add-${p.id}`}
                    onClick={() => handleQuickAdd(p)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 duration-200 shadow-sm cursor-pointer"
                    title="Thêm nhanh vào giỏ"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100">
                    Tạm Hết Hàng
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED NUTRITION MODAL DIALOG */}
      {selectedProduct && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-stone-900/60 p-4 flex items-center justify-center backdrop-blur-xs animate-fade-in">
          <div 
            id="details-modal-wrapper"
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-stone-100 shadow-2xl relative text-left"
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-50 text-stone-555 border border-stone-200/50 hover:bg-stone-100 hover:text-stone-700 active:scale-95 transition-all text-sm font-semibold cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Product Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Product illustration half */}
              <div className="p-8 bg-stone-50 flex items-center justify-center relative min-h-[300px]">
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white border shadow-xs ${getCategoryBadgeClass(selectedProduct.category)}`}>
                  {selectedProduct.brand}
                </span>
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="max-h-64 object-contain rounded-2xl transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Informative text details half */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-primary-500 uppercase">
                      {getCategoryLabel(selectedProduct.category)}
                    </span>
                    <h3 className="text-lg font-black text-stone-850 mt-1 leading-snug">
                      {selectedProduct.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                    <span>Sản phẩm chính hãng đóng lon niêm phong</span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed max-h-40 overflow-y-auto pr-2 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {selectedProduct.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-b border-stone-100 py-3 font-mono text-xs">
                    <span className="text-stone-400 font-semibold">Tình trạng kho:</span>
                    {selectedProduct.stock > 0 ? (
                      <span className="text-emerald-600 font-bold">Còn hàng: {selectedProduct.stock} hộp</span>
                    ) : (
                      <span className="text-red-500 font-bold">Tạm hết hàng</span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs font-bold text-stone-400">GIÁ BÁN NIÊM YẾT</span>
                    <span className="text-2xl font-black text-amber-500 font-mono">
                      {selectedProduct.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Multi Quantity and add click trigger */}
                <div className="flex gap-2.5 items-center">
                  {selectedProduct.stock > 0 && (
                    <div className="flex items-center border border-stone-200 bg-stone-50 rounded-xl overflow-hidden shadow-xs">
                      <button
                        onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-stone-500 hover:bg-stone-100 font-mono text-xs font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 font-bold font-mono text-xs">{detailQty}</span>
                      <button
                        onClick={() => setDetailQty((q) => Math.min(selectedProduct.stock, q + 1))}
                        className="px-3 py-2 text-stone-500 hover:bg-stone-100 font-mono text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}

                  {selectedProduct.stock > 0 ? (
                    <button
                      onClick={handleDetailAdd}
                      className="flex-1 py-3 text-sm font-extrabold text-white rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:shadow-md transition-all text-center cursor-pointer active:scale-98"
                    >
                      Thêm {detailQty} Hộp vào Giỏ Hàng
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 text-sm font-semibold text-stone-400 bg-stone-100 rounded-xl border border-stone-200 text-center"
                    >
                      Sản Phẩm Tạm Hết Hàng
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* Extended Section for Description detail, Reviews & Recommended Products as requested */}
            <div className="border-t border-stone-100 p-6 md:p-8 bg-stone-50/30 space-y-8">
              
              {/* 1. MÔ TẢ CHI TIẾT SẢN PHẨM */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-stone-800 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-blue-500 rounded-xs"></span>
                  Mô Tả Sản Phẩm & Chỉ Định Dinh Dưỡng
                </h4>
                <div className="text-xs text-stone-650 leading-relaxed space-y-2.5 bg-white p-4 rounded-xl border border-stone-100 shadow-3xs text-left">
                  <p>{selectedProduct.description}</p>
                  <p className="font-bold text-emerald-600 flex items-center gap-1">
                    ✓ Kiểm định y tế, cam kết 100% chính hãng thuộc thương hiệu {selectedProduct.brand}.
                  </p>
                  <p className="text-stone-400 text-[10.5px]">
                    * Hướng dẫn sử dụng: Pha sữa bột với nước ấm 40 - 50°C theo liều lượng ghi trên vỏ hộp. Sử dụng trong vòng 1 tháng sau khi mở nắp lon. Bảo quản tại môi trường mát mẻ khoảng 18°C.
                  </p>
                </div>
              </div>

              {/* 2. ĐÁNH GIÁ THỰC TẾ (REVIEWS) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200/60 pb-2">
                  <h4 className="text-xs font-black text-stone-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-amber-500 rounded-xs"></span>
                    Phản Hồi & Đánh Giá Chất Lượng Sữa
                  </h4>
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100/70">
                    Khuyên Dùng 4.9/5 ⭐ (Dựa trên hơn 150 lượt đặt bưu cục)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { user: "nhuquynhalhp2005", rating: 5, date: "Hôm qua", comment: `Giao hỏa tốc siêu nhanh luôn ạ, lon sữa ${selectedProduct.name} bọc chống sốc siêu dày dặn, bóc ra lon không một vết móp méo. Shop này bán sữa bột uy tín nhất Vịnh Bắc Bộ luôn, tư vấn tận tình!` },
                    { user: "Thu_Trang_HP", rating: 5, date: "3 ngày trước", comment: "Bé nhà mình uống sữa này thấy trộm vía tiêu hoá tốt hẳn, không bị táo bón. Sữa thơm mát dễ uống lắm ạ. Sẽ mua nhiều lần nữa ủng hộ shop." },
                    { user: "Minh_Quan_90", rating: 5, date: "Tuần trước", comment: `Đã check mã vạch chuẩn chính hãng ${selectedProduct.brand} 100%. Date mới nguyên đến năm sau. Vừa rẻ vừa yên tâm bồi bổ chiều cao thể trạng.` },
                    { user: "HoangLam_Vu", rating: 5, date: "10 ngày trước", comment: "Mua đợt khuyến mãi giá hời quá trời. Shop đóng bọc chuyên nghiệp như đại lý lớn, giao siêu tốc trong vòng 1 tiếng." }
                  ].map((v, i) => (
                    <div key={i} className="p-3.5 bg-white rounded-xl border border-stone-100 shadow-3xs space-y-1.5 text-left text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-stone-800">{v.user}</span>
                        <span className="text-stone-400">{v.date}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {"★".repeat(v.rating)}
                      </div>
                      <p className="text-stone-600 leading-relaxed text-[11px] font-medium">{v.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. SẢN PHẨM KHÁC ĐỀ XUẤT TƯƠNG TỰ (RECOMMENDATIONS) */}
              <div className="space-y-4">
                <div className="border-b border-stone-200/60 pb-2 text-left">
                  <h4 className="text-xs font-black text-stone-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-emerald-500 rounded-xs"></span>
                    Gợi Ý Sữa Bột Cùng Dòng Bạn Sẽ Thích
                  </h4>
                  <p className="text-[10px] text-stone-400 font-medium">Bé phát triển chiều cao & cân nặng vượt bậc với các dòng sữa liên quan</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[...products]
                    .filter((p) => p.id !== selectedProduct.id)
                    .sort((a, b) => {
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateB - dateA;
                    })
                    .slice(0, 4)
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setDetailQty(1);
                          // Scroll product detail modal to top smoothly
                          const el = document.getElementById('details-modal-wrapper');
                          if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white p-3 rounded-2xl border border-stone-150 shadow-3xs cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between"
                        title={p.name}
                      >
                        <div>
                          <div className="h-28 bg-stone-50 rounded-xl flex items-center justify-center p-2 mb-2 relative">
                            {p.featured && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[7px] font-bold uppercase">HOT</span>
                            )}
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain group-hover:scale-105 duration-200"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          
                          <div className="text-left space-y-0.5">
                            <span className="text-[8px] font-black uppercase text-stone-400 block tracking-wider leading-none">{p.brand}</span>
                            <h5 className="text-[10px] font-extrabold text-stone-800 line-clamp-2 h-7 leading-tight hover:text-primary-600 duration-150">
                              {p.name}
                            </h5>
                          </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between text-left">
                          <span className="text-[10.5px] font-mono font-black text-amber-500">
                            {p.price.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="text-[8.5px] font-black text-blue-600 bg-blue-50 py-0.5 px-1.5 rounded uppercase">Xem</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// X inline icon representation inside shop components
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
