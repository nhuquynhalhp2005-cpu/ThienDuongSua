import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Slide } from '../types';

interface BannerSliderProps {
  onShopClick: () => void;
  customSlides?: Slide[];
}

export default function BannerSlider({ onShopClick, customSlides }: BannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultSlides: Slide[] = [
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
  ];

  const slides = customSlides && customSlides.length > 0 ? customSlides : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl shadow-slate-100 mb-12">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-white opacity-5 mix-blend-overlay"></div>
      
      {/* Carousel slides container */}
      <div className="relative h-[480px] md:h-[420px] transition-all duration-700">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 transition-all duration-1000 transform ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0 scale-100 z-10' 
                : 'opacity-0 translate-x-full scale-95 z-0 pointer-events-none'
            }`}
          >
            {/* Left Content Side */}
            <div className="w-full md:w-1/2 text-white space-y-4 text-left z-20">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/25 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {slide.badge}
              </span>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {slide.title}
              </h2>
              
              <p className="text-lg font-medium text-sky-100 leading-snug">
                {slide.subtitle}
              </p>
              
              <p className="text-sm text-sky-150/90 leading-relaxed line-clamp-3 md:line-clamp-none max-w-xl">
                {slide.description}
              </p>
              
              <div className="pt-4">
                <button
                  id={`btn-slide-shop-${slide.id}`}
                  onClick={onShopClick}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-2xl bg-white text-primary-600 hover:bg-sky-50 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  {slide.buttonText}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Image Side */}
            <div className="hidden md:flex w-1/2 justify-center pl-6 relative h-full items-center">
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} rounded-full blur-3xl opacity-20`}></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full max-w-[460px] h-72 md:h-80 object-contain rounded-2xl border-4 border-white/20 shadow-2xl hover:scale-[1.02] transition-transform duration-300 z-10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Control Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            id={`btn-dot-${index}`}
            onClick={() => setCurrentSlide(index)}
            className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Trust guarantees bar inside homepage design context */}
      <div className="absolute top-0 right-0 hidden lg:flex gap-6 p-4 text-xs font-semibold text-white/85 z-20">
        <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-sky-300" /> Miễn phí vận chuyển từ 500k</span>
        <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-sky-300" /> Sữa chính hãng 100%</span>
      </div>
    </div>
  );
}
