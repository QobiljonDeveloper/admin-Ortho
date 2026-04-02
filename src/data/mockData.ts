export interface Product {
  id: string;
  sku: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  price: number;
  stock: number;
  categoryId: string;
  brandId: string;
  image: string;
}

export interface Category {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  address: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
}

export const defaultCategories: Category[] = [];

export const defaultBrands: Brand[] = [
  { id: "brand-1", name: "OrthoComfort", logo: "🏥" },
  { id: "brand-2", name: "MedSupport", logo: "🩺" },
  { id: "brand-3", name: "SpineAlign", logo: "🦴" },
  { id: "brand-4", name: "FlexiCare", logo: "💪" },
];

export const defaultProducts: Product[] = [
  { id: "prod-1", sku: "OC-PIL-001", nameUz: "Ortopedik yostiq Premium", nameRu: "Ортопедическая подушка Премиум", nameEn: "Premium Orthopedic Pillow", descriptionUz: "Yuqori sifatli ortopedik yostiq", descriptionRu: "Высококачественная ортопедическая подушка", descriptionEn: "High quality orthopedic pillow", price: 89.99, stock: 45, categoryId: "cat-1", brandId: "brand-1", image: "" },
  { id: "prod-2", sku: "MS-MAT-002", nameUz: "Ortopedik matras Medium", nameRu: "Ортопедический матрас Медиум", nameEn: "Medium Orthopedic Mattress", descriptionUz: "O'rta darajadagi ortopedik matras", descriptionRu: "Ортопедический матрас средней жёсткости", descriptionEn: "Medium firmness orthopedic mattress", price: 399.99, stock: 12, categoryId: "cat-2", brandId: "brand-2", image: "" },
  { id: "prod-3", sku: "SA-COR-003", nameUz: "Bel korseti", nameRu: "Поясничный корсет", nameEn: "Lumbar Corset", descriptionUz: "Bel og'rig'iga qarshi korset", descriptionRu: "Корсет от боли в пояснице", descriptionEn: "Corset for lower back pain", price: 59.99, stock: 78, categoryId: "cat-3", brandId: "brand-3", image: "" },
  { id: "prod-4", sku: "FC-KNE-004", nameUz: "Sport tizzaligi", nameRu: "Спортивный наколенник", nameEn: "Sport Knee Brace", descriptionUz: "Sport uchun tizzalik", descriptionRu: "Наколенник для спорта", descriptionEn: "Knee brace for sports", price: 34.99, stock: 120, categoryId: "cat-4", brandId: "brand-4", image: "" },
  { id: "prod-5", sku: "OC-PIL-005", nameUz: "Sayohat yostig'i", nameRu: "Подушка для путешествий", nameEn: "Travel Pillow", descriptionUz: "Sayohat uchun ortopedik yostiq", descriptionRu: "Ортопедическая подушка для путешествий", descriptionEn: "Orthopedic travel pillow", price: 29.99, stock: 200, categoryId: "cat-1", brandId: "brand-1", image: "" },
  { id: "prod-6", sku: "MS-MAT-006", nameUz: "Bolalar matrasi", nameRu: "Детский матрас", nameEn: "Kids Mattress", descriptionUz: "Bolalar uchun ortopedik matras", descriptionRu: "Ортопедический матрас для детей", descriptionEn: "Orthopedic mattress for kids", price: 249.99, stock: 8, categoryId: "cat-2", brandId: "brand-2", image: "" },
];

export const defaultOrders: Order[] = [
  { id: "ORD-001", customer: "Aziz Karimov", email: "aziz@mail.uz", address: "Toshkent, Chilonzor 9", date: "2024-03-15", status: "delivered", total: 89.99, items: [{ productId: "prod-1", name: "Premium Orthopedic Pillow", quantity: 1, price: 89.99 }] },
  { id: "ORD-002", customer: "Maria Ivanova", email: "maria@mail.ru", address: "Toshkent, Sergeli 7", date: "2024-03-16", status: "processing", total: 459.98, items: [{ productId: "prod-2", name: "Medium Orthopedic Mattress", quantity: 1, price: 399.99 }, { productId: "prod-3", name: "Lumbar Corset", quantity: 1, price: 59.99 }] },
  { id: "ORD-003", customer: "Bobur Aliyev", email: "bobur@mail.uz", address: "Samarqand, Registon 3", date: "2024-03-17", status: "pending", total: 34.99, items: [{ productId: "prod-4", name: "Sport Knee Brace", quantity: 1, price: 34.99 }] },
  { id: "ORD-004", customer: "Olga Petrova", email: "olga@mail.ru", address: "Buxoro, Mustaqillik 12", date: "2024-03-18", status: "shipped", total: 119.98, items: [{ productId: "prod-5", name: "Travel Pillow", quantity: 2, price: 29.99 }, { productId: "prod-3", name: "Lumbar Corset", quantity: 1, price: 59.99 }] },
  { id: "ORD-005", customer: "Jasur Toshmatov", email: "jasur@mail.uz", address: "Toshkent, Yunusobod 5", date: "2024-03-19", status: "cancelled", total: 249.99, items: [{ productId: "prod-6", name: "Kids Mattress", quantity: 1, price: 249.99 }] },
  { id: "ORD-006", customer: "Nilufar Rahimova", email: "nilufar@mail.uz", address: "Namangan, Navoi 8", date: "2024-03-20", status: "pending", total: 64.98, items: [{ productId: "prod-5", name: "Travel Pillow", quantity: 1, price: 29.99 }, { productId: "prod-4", name: "Sport Knee Brace", quantity: 1, price: 34.99 }] },
];

export const salesData = [
  { month: "Jan", sales: 4200 },
  { month: "Feb", sales: 3800 },
  { month: "Mar", sales: 5100 },
  { month: "Apr", sales: 4600 },
  { month: "May", sales: 5800 },
  { month: "Jun", sales: 6200 },
  { month: "Jul", sales: 5400 },
  { month: "Aug", sales: 7100 },
  { month: "Sep", sales: 6800 },
  { month: "Oct", sales: 7500 },
  { month: "Nov", sales: 8200 },
  { month: "Dec", sales: 9100 },
];
