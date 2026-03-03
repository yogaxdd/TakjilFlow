export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price: number;
  stock_limit: number;
  image_url: string;
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
  status: string;
  created_at: string;
  products?: Product;
}

export interface SalesData {
  date: string;
  orders: number;
  items: number;
}

export interface DashboardStats {
  totalProducts: number;
  ordersToday: number;
  totalItemsSold: number;
  stockSoldPercentage: number;
}
