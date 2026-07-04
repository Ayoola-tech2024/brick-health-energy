export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  image?: string;
  price: number;
  original_price?: number;
  description: string;
  specifications: Record<string, string>;
  tags: string[];
  in_stock: boolean;
  stock_count: number;
  rating: number;
  review_count: number;
  variants: ProductVariant[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  label: string;
  price: number;
  sku: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_sku?: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  user_id?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  payment_reference?: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_email: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_sku?: string;
  image?: string;
}

export interface StoreSettings {
  store_name: string;
  currency: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  tax_rate: number;
  phone: string;
  email: string;
  address: string;
}
