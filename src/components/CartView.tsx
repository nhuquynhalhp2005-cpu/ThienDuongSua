import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Ticket, User, MapPin, Phone, Mail, FileText, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { CartItem, Order, OrderItem, UserProfile } from '../types';
import { createOrder } from '../firebase/dbService';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQty: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  user: UserProfile | null;
  orders: Order[];
  onOpenAuth: () => void;
  onOrderCompleted: () => void;
}

export default function CartView({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  user,
  orders,
  onOpenAuth,
  onOrderCompleted
}: CartViewProps) {
  // Checkout Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Promotion simulated state
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); // VND reduced
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Auto-fill checkout fields if user is signed in
  useEffect(() => {
    if (user) {
      setCustomerName(user.displayName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Calculating math
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 500000 || subtotal === 0 ? 0 : 35000; // Free shipping above 500k
  const total = Math.max(0, subtotal + shippingFee - discount);

  // Find previous orders to check if it represents a first purchase
  const getPreviousOrdersCount = () => {
    let userOrders = [];
    if (user) {
      if (user.role === 'admin') {
        userOrders = orders.filter(o => o.userId === user.uid || (user.email && o.email?.trim().toLowerCase() === user.email.trim().toLowerCase()));
      } else {
        userOrders = orders; // Ordinary logged-in user: orders has already been loaded for user.uid
      }
    } else {
      // Guest: look up by typed email or phone
      const searchEmail = email.trim().toLowerCase();
      const searchPhone = phone.trim();
      if (searchEmail || searchPhone) {
        userOrders = orders.filter(o => 
          (searchEmail && o.email?.trim().toLowerCase() === searchEmail) || 
          (searchPhone && o.phone?.trim() === searchPhone)
        );
      }
    }
    // Filter out Cancelled orders as they are not recorded successful purchases
    return userOrders.filter(o => o.status !== 'Cancelled').length;
  };

  // Simulated code activation
  const applyPromo = (codeOverride?: string) => {
    setPromoError(null);
    setPromoSuccess(null);
    const targetCode = (codeOverride || promoCode).trim().toUpperCase();
    if (!targetCode) return;

    const previousOrdersCount = getPreviousOrdersCount();

    if (targetCode === 'GLOBU') {
      if (!user) {
        setPromoError("Mã GLOBU chỉ dành cho Hội Viên. Vui lòng ĐĂNG KÝ hoặc ĐĂNG NHẬP tài khoản trước!");
        setDiscount(0);
        return;
      }
      if (previousOrdersCount > 0) {
        setPromoError("Đăng nhập phát hiện bạn đã có đơn hàng trước đó. Mã GLOBU chỉ áp dụng cho ĐƠN HÀNG ĐẦU TIÊN!");
        setDiscount(0);
        return;
      }
      const reduction = Math.round(subtotal * 0.1); // 10% discount
      setDiscount(reduction);
      setPromoSuccess("Xin chào hội viên mới! Đã áp dụng mã giảm giá 10% cho đơn đầu tiên thành công.");
    } else if (targetCode === 'FREESHIP') {
      if (shippingFee === 0) {
        setPromoError("Đơn hàng của bạn đã được miễn phí vận chuyển tự động (trên 500k)!");
        setDiscount(0);
        return;
      }
      setDiscount(35000); // 35k refund
      setPromoSuccess("Đã áp dụng mã miễn phí vận chuyển thành công (Trừ 35.000đ tiền ship)!");
    } else if (targetCode === 'MILKVIP5') {
      if (previousOrdersCount === 0) {
        setPromoError("Mã MILKVIP5 tri ân khách hàng thân thiết từ đơn thứ 2 trở đi!");
        setDiscount(0);
        return;
      }
      const reduction = Math.round(subtotal * 0.05); // 5% discount
      setDiscount(reduction);
      setPromoSuccess("Cảm ơn sự đồng hành của bạn! Đã áp dụng mã VIP giảm 5% thành công.");
    } else if (targetCode === 'MILKSHOP20') {
      setDiscount(20000); // flat 20k refund
      setPromoSuccess("Đã lưu & áp dụng Voucher từ Shop thành công (Giảm 20.000đ)!");
    } else {
      setPromoError("Mã giảm giá không chính xác, thử: GLOBU, FREESHIP, MILKVIP5 hoặc MILKSHOP20!");
      setDiscount(0);
    }
  };

  // Submission Checkout order
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !phone || !address || !email) {
      alert("Vui lòng điền đầy đủ các thông tin giao sữa!");
      return;
    }

    setLoading(true);
    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.product.id || 'unknown',
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      }));

      const newOrder: Omit<Order, 'id'> = {
        userId: user ? user.uid : "unregistered-viewer",
        customerName,
        email,
        phone,
        address,
        paymentMethod,
        items: orderItems,
        total,
        status: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await createOrder(newOrder);
      setOrderSuccess(result);
      onClearCart();
    } catch (err) {
      console.error(err);
      alert("Xảy ra lỗi trong quá trình ghi nhận đơn hàng. Xem chi tiết thông số console.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-stone-150 rounded-3xl shadow-xl space-y-6 text-center animate-fade-in my-10">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Đặt hàng thành công
          </span>
          <h3 className="text-2xl font-black text-stone-850">Cảm ơn bạn đã tin dùng sữa của chúng tôi!</h3>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            Mã giao dịch đơn hàng là <span className="font-mono font-bold text-stone-700 bg-stone-50 px-1 py-0.5 rounded">#{orderSuccess.id?.substring(0, 8)}</span>. 
            Chúc tôi đã ghi nhận sản phẩm và cử nhân viên liên hệ tư vấn lộ trình dinh dưỡng của bạn trong 5 phút nữa!
          </p>
        </div>

        {/* Recap box */}
        <div className="p-4 bg-stone-50 rounded-2xl text-left border border-stone-100 text-xs text-stone-600 space-y-2">
          <div><span className="font-bold">Khách nhận:</span> {orderSuccess.customerName}</div>
          <div><span className="font-bold">Số điện thoại:</span> {orderSuccess.phone}</div>
          <div><span className="font-bold">Địa chỉ giao:</span> {orderSuccess.address}</div>
          <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-stone-800">
            <span>Tổng thanh toán ({paymentMethod === 'COD' ? 'Nhận COD' : 'Chuyển khoản'}):</span>
            <span className="font-mono text-amber-500 text-sm">{orderSuccess.total.toLocaleString()}đ</span>
          </div>
        </div>

        <button
          onClick={onOrderCompleted}
          className="w-full py-3.5 bg-gradient-to-r from-sky-450 to-blue-600 hover:shadow text-white font-bold text-sm rounded-xl"
        >
          Trở lại Lịch sử đơn hàng
        </button>
      </div>
    );
  }

  // EMPTY CART SCREEN
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white rounded-3xl border border-stone-150 shadow-xs my-8 space-y-4">
        <div className="p-4 bg-sky-50 text-sky-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-sm">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-stone-850">Giỏ hàng của bạn đang trống rỗng</h4>
          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            Hộp sữa nào ngon nhất? Hãy quay lại Cửa Hàng và bổ sung các can sữa bột dinh dưỡng cho bé yêu hoặc ông bà ngay!
          </p>
        </div>
        <button
          onClick={onOrderCompleted} // Back to shop inside core app
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all"
        >
          Mua Sữa Ngay Thôi <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* Left panel: Cart Items Checklist (7 Columns) */}
      <div className="lg:col-span-7 space-y-6">
        <h3 className="text-lg font-black text-stone-800 flex items-center gap-2">
          DANH SÁCH GIỎ HÀNG ({cart.length} sản phẩm)
        </h3>

        <div className="space-y-3.5">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="p-4 bg-white border border-stone-150 rounded-2xl shadow-xs flex gap-4 items-center justify-between"
            >
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-16 h-16 object-contain rounded-xl bg-stone-50 p-1 border border-stone-200/50"
                referrerPolicy="no-referrer"
              />

              <div className="flex-1 min-w-0 pr-4 space-y-1">
                <span className="text-[9px] font-black tracking-wider text-stone-400 uppercase">
                  Hãng {item.product.brand}
                </span>
                <h4 className="text-xs font-bold text-stone-800 truncate" title={item.product.name}>
                  {item.product.name}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-500 font-mono">
                    {item.product.price.toLocaleString()}đ
                  </span>
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium">
                    Có hàng
                  </span>
                </div>
              </div>

              {/* Quantity selectors & Trash buttons */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-200 bg-stone-50 rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => onUpdateQty(item.product.id!, item.quantity - 1)}
                    className="px-2 py-1 text-stone-500 hover:bg-stone-100 font-mono text-xs font-bold pointer-events-auto"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold font-mono">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id!, item.quantity + 1)}
                    className="px-2 py-1 text-stone-500 hover:bg-stone-100 font-mono text-xs font-bold pointer-events-auto"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.product.id!)}
                  className="p-2 text-stone-450 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 cursor-pointer"
                  title="Xoá sữa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Shopee-style Voucher Selector Bar */}
        <div className="bg-white p-4.5 rounded-2xl border border-stone-150 shadow-xs flex items-center justify-between transition-all hover:bg-stone-50/40">
          <div className="flex items-center gap-3">
            <Ticket className="w-5.5 h-5.5 text-orange-500 bg-orange-50 p-1.5 rounded-xl border border-orange-105" />
            <div className="text-left">
              <span className="text-[11.5px] font-black text-stone-850 block">Shop Voucher</span>
              {discount > 0 ? (
                <span className="inline-block text-[9.5px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-100 mt-0.5 animate-pulse">
                  Đã áp dụng: {promoCode.toUpperCase()} (Giảm -{discount.toLocaleString('vi-VN')}đ)
                </span>
              ) : (
                <span className="text-[10px] text-stone-400 font-semibold block mt-0.5">Chọn hoặc nhập mã giảm giá độc quyền</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPromoError(null);
              setPromoSuccess(null);
              setShowVoucherModal(true);
            }}
            className="text-xs font-black text-sky-600 hover:text-sky-700 transition-all flex items-center gap-0.5 cursor-pointer"
          >
            Chọn mã ưu đãi <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>

      </div>

      {/* Right panel: Checkout address & Payment forms (5 Columns) */}
      <form onSubmit={handleCheckout} className="lg:col-span-5 space-y-6 bg-white p-6 border border-stone-150 rounded-3xl shadow-sm h-fit">
        <h3 className="text-base font-black text-stone-850 pb-3 border-b border-stone-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          <span>THÔNG TIN THANH TOÁN & GIAO SỮA</span>
        </h3>

        {/* If guest, show brief note */}
        {!user && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 font-bold">
            💡 Bạn đang mua với tư cách KHÁCH. Bạn có thể ĐĂNG NHẬP bằng nút phía trên để tự động theo dõi lịch sử và tích luỹ điểm thưởng tốt hơn.
          </div>
        )}

        {/* Checkout Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase">Họ và tên người nhận *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-350" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase">Số điện thoại liên hệ *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-350" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912xxxxxx"
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase">Hòm thư Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-350" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="khachhang@gmail.com"
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase">Địa chỉ nhận sữa chi tiết *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-stone-350" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                rows={3}
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 text-left"
                required
              />
            </div>
          </div>

          {/* Payment option */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-stone-400 uppercase block">Phương thức thanh toán</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                paymentMethod === 'COD' ? 'border-primary-500 bg-sky-50/20' : 'border-stone-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <span className="font-bold text-stone-800">1. Nhận hàng trả tiền (COD)</span>
                <span className="text-[9px] text-stone-400 mt-1">Trả tiền mặt khi Shipper giao hộp sữa tới tận nhà.</span>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                paymentMethod === 'Transfer' ? 'border-primary-500 bg-sky-50/20' : 'border-stone-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="Transfer"
                  checked={paymentMethod === 'Transfer'}
                  onChange={() => setPaymentMethod('Transfer')}
                  className="sr-only"
                />
                <span className="font-bold text-stone-800">2. Chuyển Khoản</span>
                <span className="text-[9px] text-stone-400 mt-1">Quét mã QR thanh toán ngân hàng (Được duyệt nhanh sữa).</span>
              </label>
            </div>

            {paymentMethod === 'Transfer' && (
              <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-150 space-y-3 animate-fade-in text-left">
                <div className="text-center font-black text-[10px] text-sky-800 tracking-wider pb-1 border-b border-sky-100">
                  ⚡ MÃ QR THANH TOÁN TIỆN LỢI (VIETQR)
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative w-36 h-36 bg-white p-2 rounded-xl border border-stone-150 flex items-center justify-center shadow-xs shrink-0">
                    <img 
                      src={`https://img.vietqr.io/image/mbbank-0912678987-compact2.png?amount=${total}&addInfo=MILKSHOP%20${encodeURIComponent((customerName || 'KHACH').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase())}%20${phone || 'SDT'}&accountName=NGUYEN%20NHU%20QUYNH`}
                      alt="VietQR MB Bank"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-stone-700 flex-1">
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-bold block leading-none">Ngân hàng</span>
                      <strong className="text-stone-850">MB Bank (Quân Đội)</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-bold block leading-none">Số tài khoản</span>
                      <strong className="text-blue-600 font-mono text-sm leading-none">0912678987</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-bold block leading-none">Chủ tài khoản</span>
                      <strong className="text-stone-850">NGUYEN NHU QUYNH</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-bold block leading-none">Nội dung chuyển khoản</span>
                      <strong className="inline-block bg-sky-100 text-sky-800 px-2 py-1 rounded font-mono text-[11px] font-bold select-all border border-sky-200">
                        MILKSHOP {(customerName || 'KHACH').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase()} {phone || ''}
                      </strong>
                    </div>
                  </div>
                </div>
                
                <p className="text-[10.5px] text-stone-450 leading-relaxed font-semibold">
                  * Hệ thống sẽ tự động đối soát trạng thái giao dịch. Vui lòng giữ đúng nội dung chuyển khoản được định dạng ở trên để đơn hàng được duyệt lập tức.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Subtotal Recap */}
        <div className="border-t border-stone-100 pt-4 space-y-2 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Tổng tiền sữa bột:</span>
            <span className="font-mono font-bold text-stone-800">{subtotal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span className="font-mono font-bold text-stone-800">
              {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-650 font-bold bg-emerald-50 px-2 py-1 rounded">
              <span>Đã trừ ưu đãi:</span>
              <span className="font-mono">-{discount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="border-t border-stone-100 pt-3 flex justify-between font-extrabold text-sm text-stone-850">
            <span>Tổng số cần thanh toán:</span>
            <span className="font-mono text-lg text-amber-500">{total.toLocaleString()}đ</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg active:scale-95 duration-200 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Đang xử lý đơn sữa của bạn..." : `Đặt Hàng Hoàn Tất (${total.toLocaleString()}đ)`}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-semibold pt-1">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
          <span>Thời gian giao hàng toàn quốc từ 1-3 ngày</span>
        </div>

      </form>

      {/* Shopee-style Voucher Selector Modal Pop-up */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-55 bg-stone-900/60 p-4 flex items-center justify-center backdrop-blur-xs animate-fade-in text-left">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-stone-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-black text-stone-850">Shop Voucher</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="p-1.5 px-2 rounded-full hover:bg-stone-100 text-stone-500 duration-150 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* Type manually option */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Mã Voucher của bạn</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã ưu đãi khác..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 uppercase outline-none focus:border-sky-500 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => applyPromo(promoCode)}
                    className="px-4 py-2 bg-stone-800 hover:bg-black text-white text-xs font-black rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    Áp Dụng
                  </button>
                </div>
                {promoSuccess && <p className="text-[10.5px] font-black text-emerald-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-150">{promoSuccess}</p>}
                {promoError && <p className="text-[10.5px] font-black text-red-500 bg-red-50/50 p-2 rounded-lg border border-red-150">{promoError}</p>}
              </div>

              {/* Status Header */}
              <div className="bg-sky-50/30 p-3 rounded-xl border border-sky-100 flex justify-between items-center text-xs">
                <span className="text-stone-600 font-semibold">Tình trạng tài khoản:</span>
                {user ? (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    getPreviousOrdersCount() === 0 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' 
                      : 'bg-indigo-50 text-indigo-650 border border-indigo-150'
                  }`}>
                    {getPreviousOrdersCount() === 0 ? "🆕 Hội viên mới" : `⭐ VIP Thân thiết (${getPreviousOrdersCount()} đơn)`}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-150">
                    👤 Khách (Nhập thông tin đặt để xem ưu đãi phù hợp)
                  </span>
                )}
              </div>

              {/* Vouchers list */}
              <div className="space-y-3 pt-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Chọn 1 Voucher phù hợp:</label>
                
                <div className="space-y-2.5">
                  {/* VOUCHER 1: GLOBU */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-left relative transition-all gap-3 ${
                    getPreviousOrdersCount() === 0 
                      ? 'border-orange-200 bg-orange-50/5 hover:bg-orange-50/15' 
                      : 'border-stone-150 bg-stone-50/50 opacity-60'
                  }`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10.5px] font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded font-mono border border-orange-150">GLOBU</span>
                        <span className="text-[9px] font-black text-stone-500">Giảm 10% đơn đầu</span>
                      </div>
                      <p className="text-[11px] font-black text-stone-850">Ưu đãi độc quyền Hội Viên mới</p>
                      <p className="text-[9.5px] text-stone-450 leading-tight">Chỉ dành cho đơn hàng đầu tiên của hội viên đăng ký thành công.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoCode('GLOBU');
                        applyPromo('GLOBU');
                      }}
                      disabled={getPreviousOrdersCount() > 0}
                      className="px-3 py-1.5 text-[10px] font-black bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all cursor-pointer disabled:bg-stone-100 disabled:text-stone-400 shrink-0 select-none"
                    >
                      Dùng mã
                    </button>
                  </div>

                  {/* VOUCHER 2: FREESHIP */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-left relative transition-all gap-3 ${
                    getPreviousOrdersCount() > 0 
                      ? 'border-emerald-200 bg-emerald-50/5 hover:bg-emerald-50/15' 
                      : 'border-stone-150 bg-stone-50/50 opacity-60'
                  }`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono border border-emerald-150">FREESHIP</span>
                        <span className="text-[9px] font-black text-stone-500">Miễn phí ship</span>
                      </div>
                      <p className="text-[11px] font-black text-stone-850">Miễn phí vận chuyển toàn quốc</p>
                      <p className="text-[9.5px] text-stone-450 leading-tight">Giảm ngay 35.000đ trực tiếp vào tiền vận chuyển từ đơn thứ 2.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoCode('FREESHIP');
                        applyPromo('FREESHIP');
                      }}
                      className="px-3 py-1.5 text-[10px] font-black bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all cursor-pointer shrink-0 select-none"
                    >
                      Dùng mã
                    </button>
                  </div>

                  {/* VOUCHER 3: MILKVIP5 */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-left relative transition-all gap-3 ${
                    getPreviousOrdersCount() > 0 
                      ? 'border-indigo-200 bg-indigo-50/5 hover:bg-indigo-50/15' 
                      : 'border-stone-150 bg-stone-50/50 opacity-60'
                  }`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10.5px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono border border-indigo-150">MILKVIP5</span>
                        <span className="text-[9px] font-black text-stone-500">Giảm 5% VIP</span>
                      </div>
                      <p className="text-[11px] font-black text-stone-850">Tri ân thành viên trung thành</p>
                      <p className="text-[9.5px] text-stone-450 leading-tight">Ưu đãi giảm thêm 5% dành riêng cho khách hàng VIP thân thiết từ đơn hàng thứ 2.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoCode('MILKVIP5');
                        applyPromo('MILKVIP5');
                      }}
                      className="px-3 py-1.5 text-[10px] font-black bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all cursor-pointer shrink-0 select-none"
                    >
                      Dùng mã
                    </button>
                  </div>

                  {/* VOUCHER 4: MILKSHOP20 */}
                  <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/5 hover:bg-amber-50/15 flex items-center justify-between text-left relative transition-all gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10.5px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-mono border border-amber-150">MILKSHOP20</span>
                        <span className="text-[9px] font-black text-stone-500">Giảm giá 20.000đ</span>
                      </div>
                      <p className="text-[11px] font-black text-stone-850">Voucher của Shop</p>
                      <p className="text-[9.5px] text-stone-450 leading-tight">Tặng ngay 20.000đ giảm trực tiếp vào mọi đơn đặt hàng trực tuyến.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoCode('MILKSHOP20');
                        applyPromo('MILKSHOP20');
                      }}
                      className="px-3 py-1.5 text-[10px] font-black bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all cursor-pointer shrink-0 select-none"
                    >
                      Dùng mã
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition-all cursor-pointer active:scale-95 text-center shadow-xs"
              >
                Đồng Ý
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
