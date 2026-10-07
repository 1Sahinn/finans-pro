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
export type ProductTur = 'Alt' | 'Takım' | 'Üst' | 'Diğer';

// ===== ODA =====
export interface Room {
  id: string;
  name: string;
  createdAt: string;
}

// ===== ÜRÜN (Oda bazlı, tekstil odaklı) =====
export interface Product {
  id: string;
  roomId: string;
  barkod: string;
  tur: ProductTur;
  name: string;
  fiyat: string; // "260" veya "225-230" şeklinde yazılabilir
  createdAt: string;
  updatedAt: string;
}

// ===== KASa İŞLEMİ =====
export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currentId?: string;
  date: string;
  createdAt: string;
}

// ===== CARİ =====
export interface Current {
  id: string;
  type: CurrentType;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== CARİ DEFTER KAYDII (her satır) =====
export interface CurrentLedgerEntry {
  id: string;
  currentId: string;
  tarih: string;         // "2024-10-07"
  aciklama: string;
  miktar: number;
  fiyat: number;
  tutar: number;         // = miktar * fiyat
  odeme: number;
  bakiye: number;        // kümülatif bakiye
  createdAt: string;
}

// ===== SATIŞ =====
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  currentId?: string;
  date: string;
  createdAt: string;
}

export interface AppSettings {
  companyName: string;
  currency: string;
}

export interface AppState {
  rooms: Room[];
  products: Product[];
  transactions: Transaction[];
  currents: Current[];
  currentLedgerEntries: CurrentLedgerEntry[];
  sales: Sale[];
  settings: AppSettings;
}
