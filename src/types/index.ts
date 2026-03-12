export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price: number;
  stock_limit: number;
  image_url: string;
  category: string;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  promo_code: string;
  discount_amount: number;
  order_notes: string;
  status: string;
  created_at: string;
  products?: Product;
}

export interface SalesData {
  date: string;
  orders: number;
  items: number;
  revenue: number;
}

export interface DashboardStats {
  totalProducts: number;
  ordersToday: number;
  totalItemsSold: number;
  stockSoldPercentage: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string | null;
  store_description: string;
  whatsapp_number: string;
  banner_url: string;
  ewallet_number: string;
  ewallet_name: string;
  qris_url: string;
  bank_name: string;
  payment_config: Record<string, boolean>;
  created_at: string;
}

export interface PromoCode {
  id: string;
  user_id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}
