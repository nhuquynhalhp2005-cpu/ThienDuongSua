import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    name: "Sữa Bột Abbott Grow G-Power 4 (Hương Vani)",
    price: 345000,
    brand: "Abbott",
    category: "children",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=60",
    description: "Sữa bột Abbott Grow 4 với hệ dưỡng chất G-Power giàu Canxi, Phốt pho, Vitamin D dồi dào, hỗ trợ bé phát triển chiều cao vượt trội, phát triển não bộ và thể chất tối đa trong giai đoạn từ 2 đến 6 tuổi.",
    stock: 24,
    featured: true,
    isNew: false,
    createdAt: new Date("2026-05-01").toISOString()
  },
  {
    name: "Sữa Bột Meiji Growing Up Formula nội địa Nhật",
    price: 460000,
    brand: "Meiji",
    category: "children",
    imageUrl: "https://images.unsplash.com/photo-1550583794-a1552db1c251?w=600&auto=format&fit=crop&q=60",
    description: "Sữa bột Meiji thơm ngon, thanh mát tự nhiên giúp bé tăng cân tự nhiên, bổ sung DHA và ARA dồi dào hỗ trợ tối ưu hệ miễn dịch và phát triển tế bào võng mạc, dành cho trẻ từ 1 đến 3 tuổi.",
    stock: 18,
    featured: true,
    isNew: true,
    createdAt: new Date("2026-06-01").toISOString()
  },
  {
    name: "Sữa Bột Abbott Ensure Gold (Hương Vani)",
    price: 780000,
    brand: "Abbott",
    category: "adults",
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=60",
    description: "Sữa bột Ensure Gold là nguồn sữa dinh dưỡng hoàn chỉnh và cân đối nhất giúp bổ sung HMB bảo vệ và tái tạo cơ. Thích hợp cho người lớn cần tăng cường sức khoẻ thể lực và tăng cường phục hồi.",
    stock: 35,
    featured: true,
    isNew: false,
    createdAt: new Date("2025-12-15").toISOString()
  },
  {
    name: "Sữa Bột Anlene Gold 3X Hương Vani thơm mát",
    price: 395000,
    brand: "Anlene",
    category: "seniors",
    imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&auto=format&fit=crop&q=60",
    description: "Anlene Gold 3X chứa công thức tiên tiến Active 3 bổ sung Đạm cấu trúc bền vững, Canxi 100% nhu cầu hàng ngày, và Collagen hỗ trợ xương khớp dẻo dai linh hoạt cho người từ 40 tuổi trở lên.",
    stock: 15,
    featured: false,
    isNew: true,
    createdAt: new Date("2026-06-10").toISOString()
  },
  {
    name: "Sữa Bột Vinamilk Sure Prevent Gold dinh dưỡng đặc chế",
    price: 565000,
    brand: "Vinamilk",
    category: "seniors",
    imageUrl: "https://images.unsplash.com/photo-1560015534-eca37e14cb54?w=600&auto=format&fit=crop&q=60",
    description: "Sữa bột Vinamilk Sure Prevent Gold giúp bổ sung Canxi, Ester-Sterol thực vật làm giảm cholesterol xấu trong máu và tăng cường bảo vệ hệ tim mạch, phòng chống loãng xương hiệu quả ở người cao tuổi.",
    stock: 20,
    featured: true,
    isNew: false,
    createdAt: new Date("2026-04-10").toISOString()
  },
  {
    name: "Sữa Frisomum Gold Hương Cam dễ uống cho mẹ bầu",
    price: 420000,
    brand: "Friso",
    category: "pregnant",
    imageUrl: "https://images.unsplash.com/photo-1531983412531-1f49a365f69a?w=600&auto=format&fit=crop&q=60",
    description: "Sữa bầu Frisomum Gold giàu Sắt, Acid Folic, và canxi bổ sung dinh dưỡng kép cho mẹ bầu khoẻ mạnh và thai nhi tăng trưởng kích thước ổn định. Vị cam thơm ngọt nhẹ, dễ uống, giảm triệu chứng ốm nghén.",
    stock: 12,
    featured: false,
    isNew: false,
    createdAt: new Date("2026-03-20").toISOString()
  },
  {
    name: "Sữa Bột Pediasure BA Hương Vani (Dành cho trẻ biếng ăn)",
    price: 620000,
    brand: "Abbott",
    category: "children",
    imageUrl: "https://images.unsplash.com/photo-1500595046783-cd2aa6df4e61?w=600&auto=format&fit=crop&q=60",
    description: "Sữa bột Pediasure BA cải thiện tình trạng sụt cân, biếng ăn ở trẻ từ 1 đến 10 tuổi. Công thức dinh dưỡng chuyên sâu với 37 cốc cốt lõi thúc đẩy tăng trưởng cân nặng vượt bậc và tăng cường hệ tiêu hóa.",
    stock: 30,
    featured: true,
    isNew: false,
    createdAt: new Date("2026-05-15").toISOString()
  },
  {
    name: "Sữa Bột Abbott Similac Neosure dinh dưỡng đặc biệt",
    price: 540000,
    brand: "Abbott",
    category: "children",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=60",
    description: "Công thức Similac NeoSure thích hợp nhất cho trẻ sinh non và nhẹ cân từ sơ sinh tới 12 tháng tuổi, kích thích thị lực dồi dào, hoàn thiện các tế bào hệ tim và đẩy mạnh tốc độ phát triển thể lực.",
    stock: 16,
    featured: false,
    isNew: true,
    createdAt: new Date("2026-06-11").toISOString()
  }
];
