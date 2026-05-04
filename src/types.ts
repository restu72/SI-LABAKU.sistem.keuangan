
export interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  initialStock: number;
  unit: string;
  imageUrl?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtSale: number;
  costAtSale: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  totalCost: number;
  paymentMethod: 'tunai' | 'kredit';
  discount: number;
  customerName?: string;
  customerAddress?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface BusinessProfile {
  ownerName: string;
  businessName: string;
  address: string;
  logoUrl: string;
}

export interface ArchivedReport {
  month: string; // YYYY-MM
  totalRevenue: number;
  totalCOGS: number;
  totalExpenses: number;
  netProfit: number;
  salesCount: number;
  expensesCount: number;
}

export type AppView = 'kasir' | 'persediaan' | 'beban' | 'laporan' | 'dashboard' | 'settings' | 'laporan-archive' | 'log-aktivitas';
