import type { AppState, Product, Transaction, Current, Sale } from '../types';

const STORAGE_KEY = 'finanspro_data';

// Demo verisi
function getDefaultState(): AppState {
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  const products: Product[] = [
    {
      id: 'p1',
      name: 'Laptop Çantası Premium',
      barcode: '8680000000001',
      category: 'Aksesuar',
      purchasePrice: 250,
      salePrice: 450,
      vatRate: 20,
      stock: 15,
      criticalStock: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'p2',
      name: 'Mekanik Klavye',
      barcode: '8680000000002',
      category: 'Bilgisayar',
      purchasePrice: 800,
      salePrice: 1350,
      vatRate: 20,
      stock: 3,
      criticalStock: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'p3',
      name: 'USB-C Hub 7 Port',
      barcode: '8680000000003',
      category: 'Aksesuar',
      purchasePrice: 180,
      salePrice: 320,
      vatRate: 20,
      stock: 22,
      criticalStock: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'p4',
      name: 'Kablosuz Mouse',
      barcode: '8680000000004',
      category: 'Bilgisayar',
      purchasePrice: 120,
      salePrice: 220,
      vatRate: 20,
      stock: 2,
      criticalStock: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'p5',
      name: 'Monitör Standı Ayarlanabilir',
      barcode: '8680000000005',
      category: 'Mobilya',
      purchasePrice: 350,
      salePrice: 590,
      vatRate: 20,
      stock: 8,
      criticalStock: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const currents: Current[] = [
    {
      id: 'c1',
      type: 'musteri',
      name: 'Ahmet Yılmaz',
      phone: '0532 111 2233',
      email: 'ahmet@example.com',
      balance: 2500,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'c2',
      type: 'musteri',
      name: 'Büyük Teknoloji A.Ş.',
      phone: '0212 444 5566',
      email: 'info@buyukteknoloji.com',
      balance: -1200,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'c3',
      type: 'tedarikci',
      name: 'Elektronik Toptan Ltd.',
      phone: '0216 777 8899',
      balance: -3800,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'c4',
      type: 'tedarikci',
      name: 'İthal Aksesuar A.Ş.',
      phone: '0262 333 4455',
      balance: -800,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 't1',
      type: 'gelir',
      category: 'satis',
      description: 'Laptop Çantası Satışı x5',
      amount: 2250,
      paymentMethod: 'nakit',
      date: today,
      createdAt: now,
    },
    {
      id: 't2',
      type: 'gelir',
      category: 'tahsilat',
      description: 'Ahmet Yılmaz cari tahsilat',
      amount: 1500,
      paymentMethod: 'havale_eft',
      currentId: 'c1',
      date: today,
      createdAt: now,
    },
    {
      id: 't3',
      type: 'gider',
      category: 'kira',
      description: 'Ekim ayı mağaza kirası',
      amount: 8500,
      paymentMethod: 'havale_eft',
      date: today,
      createdAt: now,
    },
    {
      id: 't4',
      type: 'gider',
      category: 'mal_alimi',
      description: 'Mekanik Klavye stok alımı x10',
      amount: 8000,
      paymentMethod: 'havale_eft',
      currentId: 'c3',
      date: today,
      createdAt: now,
    },
    {
      id: 't5',
      type: 'gelir',
      category: 'satis',
      description: 'USB-C Hub Satışı x3',
      amount: 960,
      paymentMethod: 'kredi_karti',
      date: today,
      createdAt: now,
    },
    {
      id: 't6',
      type: 'gider',
      category: 'fatura',
      description: 'Elektrik faturası',
      amount: 1250,
      paymentMethod: 'nakit',
      date: today,
      createdAt: now,
    },
    {
      id: 't7',
      type: 'gelir',
      category: 'satis',
      description: 'Kablosuz Mouse x8',
      amount: 1760,
      paymentMethod: 'kredi_karti',
      date: today,
      createdAt: now,
    },
    {
      id: 't8',
      type: 'gider',
      category: 'maas',
      description: 'Personel maaşları',
      amount: 25000,
      paymentMethod: 'havale_eft',
      date: today,
      createdAt: now,
    },
  ];

  return {
    products,
    transactions,
    currents,
    sales: [],
    settings: {
      companyName: 'Demo Mağaza Ltd. Şti.',
      currency: '₺',
    },
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // ignore
  }
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('localStorage kayıt hatası');
  }
}

// --- Yardımcı CRUD fonksiyonları ---

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function addProduct(state: AppState, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newProduct: Product = {
    ...product,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const newState = { ...state, products: [...state.products, newProduct] };
  saveState(newState);
  return newState;
}

export function updateProduct(state: AppState, id: string, updates: Partial<Product>): AppState {
  const newState = {
    ...state,
    products: state.products.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteProduct(state: AppState, id: string): AppState {
  const newState = { ...state, products: state.products.filter(p => p.id !== id) };
  saveState(newState);
  return newState;
}

export function addTransaction(state: AppState, transaction: Omit<Transaction, 'id' | 'createdAt'>): AppState {
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const newState = { ...state, transactions: [newTransaction, ...state.transactions] };
  saveState(newState);
  return newState;
}

export function deleteTransaction(state: AppState, id: string): AppState {
  const newState = { ...state, transactions: state.transactions.filter(t => t.id !== id) };
  saveState(newState);
  return newState;
}

export function addCurrent(state: AppState, current: Omit<Current, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newCurrent: Current = {
    ...current,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const newState = { ...state, currents: [...state.currents, newCurrent] };
  saveState(newState);
  return newState;
}

export function updateCurrent(state: AppState, id: string, updates: Partial<Current>): AppState {
  const newState = {
    ...state,
    currents: state.currents.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteCurrent(state: AppState, id: string): AppState {
  const newState = { ...state, currents: state.currents.filter(c => c.id !== id) };
  saveState(newState);
  return newState;
}

export function processSale(state: AppState, sale: Omit<Sale, 'id' | 'createdAt'>): AppState {
  const newSale: Sale = {
    ...sale,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  // Stoktan düş
  let products = state.products.map(p => {
    const item = sale.items.find(i => i.productId === p.id);
    if (item) {
      return { ...p, stock: p.stock - item.quantity, updatedAt: new Date().toISOString() };
    }
    return p;
  });

  // Kasa gelir kaydı
  const saleTransaction: Transaction = {
    id: generateId(),
    type: 'gelir',
    category: 'satis',
    description: `Satış Fişi #${newSale.id.substring(0, 8)} (${sale.items.length} ürün)`,
    amount: sale.total,
    paymentMethod: sale.paymentMethod,
    currentId: sale.currentId,
    date: sale.date,
    createdAt: new Date().toISOString(),
  };

  const newState = {
    ...state,
    products,
    sales: [newSale, ...state.sales],
    transactions: [saleTransaction, ...state.transactions],
  };
  saveState(newState);
  return newState;
}

// ===== HESAPLAMA YARDIMCILARI =====

export function getTodayStats(state: AppState) {
  const today = new Date().toISOString().split('T')[0];
  const todayTx = state.transactions.filter(t => t.date === today);
  const income = todayTx.filter(t => t.type === 'gelir').reduce((sum, t) => sum + t.amount, 0);
  const expense = todayTx.filter(t => t.type === 'gider').reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, net: income - expense };
}

export function getMonthStats(state: AppState) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTx = state.transactions.filter(t => t.date.startsWith(month));
  const income = monthTx.filter(t => t.type === 'gelir').reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'gider').reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, net: income - expense };
}

export function getTotalCashBalance(state: AppState) {
  const cash = state.transactions
    .filter(t => t.paymentMethod === 'nakit')
    .reduce((sum, t) => (t.type === 'gelir' ? sum + t.amount : sum - t.amount), 0);
  const bank = state.transactions
    .filter(t => t.paymentMethod === 'havale_eft' || t.paymentMethod === 'kredi_karti')
    .reduce((sum, t) => (t.type === 'gelir' ? sum + t.amount : sum - t.amount), 0);
  return { cash, bank, total: cash + bank };
}

export function getCriticalStockProducts(state: AppState): Product[] {
  return state.products.filter(p => p.stock <= p.criticalStock);
}
