// ===== TEMEL TİPLER =====

export type PaymentMethod = 'nakit' | 'kredi_karti' | 'havale_eft';
export type TransactionType = 'gelir' | 'gider';
export type TransactionCategory =
  | 'satis'
  | 'tahsilat'
  | 'kira'
  | 'mal_alimi'
  | 'fatura'
  | 'maas'
  | 'diger_gelir'
  | 'diger_gider';
export type CurrentType = 'musteri' | 'tedarikci';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  vatRate: number; // %
  stock: number;
  criticalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currentId?: string; // Cari bağlantısı
  date: string;
  createdAt: string;
}

export interface Current {
  id: string;
  type: CurrentType;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // (+) alacak, (-) borç (firmaya göre)
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  totalVat: number;
  total: number;
  paymentMethod: PaymentMethod;
  currentId?: string;
  date: string;
  createdAt: string;
}

export interface AppSettings {
  companyName: string;
  currency: string;
  taxNumber?: string;
  phone?: string;
}

export interface AppState {
  products: Product[];
  transactions: Transaction[];
  currents: Current[];
  sales: Sale[];
  settings: AppSettings;
}
