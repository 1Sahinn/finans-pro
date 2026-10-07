import type { AppState, Product, Room, Transaction, Current, CurrentLedgerEntry, Sale } from '../types';

const STORAGE_KEY = 'finanspro_data_v2';

function getDefaultState(): AppState {
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  const rooms: Room[] = [
    { id: 'r1', name: 'Dükkan-Sol', createdAt: now },
    { id: 'r2', name: 'Dükkan-Sağ', createdAt: now },
    { id: 'r3', name: 'Dükkan-Orta', createdAt: now },
    { id: 'r4', name: 'Depo-Oda1', createdAt: now },
  ];

  const products: Product[] = [
    { id: 'p1', roomId: 'r1', barkod: '1004', tur: 'Alt',   name: 'Dalgıç Şardon Battal Düz Paça', fiyat: '225-230', createdAt: now, updatedAt: now },
    { id: 'p2', roomId: 'r1', barkod: '1077', tur: 'Takım', name: 'Üçiplik Kapüşonlu',              fiyat: '',        createdAt: now, updatedAt: now },
    { id: 'p3', roomId: 'r1', barkod: '3064', tur: 'Alt',   name: 'Keten Pantolon',                 fiyat: '260',     createdAt: now, updatedAt: now },
    { id: 'p4', roomId: 'r1', barkod: '3060', tur: 'Alt',   name: 'Dalgıç Jogger Paça',             fiyat: '190',     createdAt: now, updatedAt: now },
    { id: 'p5', roomId: 'r1', barkod: '3088', tur: 'Takım', name: 'Double Garson Takım',            fiyat: '',        createdAt: now, updatedAt: now },
    { id: 'p6', roomId: 'r2', barkod: '1004', tur: 'Alt',   name: 'Penye Battal Düzpaça',           fiyat: '',        createdAt: now, updatedAt: now },
    { id: 'p7', roomId: 'r2', barkod: '3089', tur: 'Takım', name: 'Dalgıç Şardonlu Battal',        fiyat: '230',     createdAt: now, updatedAt: now },
    { id: 'p8', roomId: 'r3', barkod: '2000', tur: 'Alt',   name: 'Dalgıç Şardon Slim Fix Düz Paça', fiyat: '',      createdAt: now, updatedAt: now },
    { id: 'p9', roomId: 'r3', barkod: '2093', tur: 'Üst',   name: 'Penye Tshirt',                   fiyat: '',        createdAt: now, updatedAt: now },
    { id: 'p10', roomId: 'r4', barkod: '1006', tur: 'Üst',  name: 'Üçiplik Torbacep Baggy',         fiyat: '325',     createdAt: now, updatedAt: now },
  ];

  const currents: Current[] = [
    { id: 'c1', type: 'musteri',   name: 'Ahmet Yılmaz',         phone: '0532 111 2233', createdAt: now, updatedAt: now },
    { id: 'c2', type: 'musteri',   name: 'Mehmet Kaya',          phone: '0542 333 4455', createdAt: now, updatedAt: now },
    { id: 'c3', type: 'tedarikci', name: 'Tekstil Toptan A.Ş.', phone: '0212 777 8899', createdAt: now, updatedAt: now },
  ];

  // Örnek defter kayıtları
  const currentLedgerEntries: CurrentLedgerEntry[] = [
    { id: 'e1', currentId: 'c1', tarih: today, aciklama: 'Mal alımı', miktar: 3, fiyat: 9, tutar: 27, odeme: 10, bakiye: 17, createdAt: now },
    { id: 'e2', currentId: 'c1', tarih: today, aciklama: 'Ödeme', miktar: 0, fiyat: 0, tutar: 0, odeme: 5, bakiye: 12, createdAt: now },
  ];

  const transactions: Transaction[] = [
    { id: 't1', type: 'gelir', category: 'satis', description: 'Satış', amount: 500, paymentMethod: 'nakit', date: today, createdAt: now },
    { id: 't2', type: 'gider', category: 'kira', description: 'Ekim kirası', amount: 8500, paymentMethod: 'havale_eft', date: today, createdAt: now },
  ];

  return {
    rooms,
    products,
    transactions,
    currents,
    currentLedgerEntries,
    sales: [],
    settings: { companyName: 'IŞIK Tekstil', currency: '₺' },
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Migration: eski kayıt varsa yeni alanları ekle
      if (!parsed.rooms) parsed.rooms = [];
      if (!parsed.currentLedgerEntries) parsed.currentLedgerEntries = [];
      return parsed;
    }
  } catch { /* ignore */ }
  const def = getDefaultState();
  saveState(def);
  return def;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { console.error('localStorage kayıt hatası'); }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ===== ODA CRUD =====
export function addRoom(state: AppState, room: Omit<Room, 'id' | 'createdAt'>): AppState {
  const newRoom: Room = { ...room, id: generateId(), createdAt: new Date().toISOString() };
  const newState = { ...state, rooms: [...state.rooms, newRoom] };
  saveState(newState);
  return newState;
}

export function updateRoom(state: AppState, id: string, updates: Partial<Room>): AppState {
  const newState = { ...state, rooms: state.rooms.map(r => r.id === id ? { ...r, ...updates } : r) };
  saveState(newState);
  return newState;
}

export function deleteRoom(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    rooms: state.rooms.filter(r => r.id !== id),
    products: state.products.filter(p => p.roomId !== id),
  };
  saveState(newState);
  return newState;
}

// ===== ÜRÜN CRUD =====
export function addProduct(state: AppState, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newProduct: Product = { ...product, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const newState = { ...state, products: [...state.products, newProduct] };
  saveState(newState);
  return newState;
}

export function updateProduct(state: AppState, id: string, updates: Partial<Product>): AppState {
  const newState = { ...state, products: state.products.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p) };
  saveState(newState);
  return newState;
}

export function deleteProduct(state: AppState, id: string): AppState {
  const newState = { ...state, products: state.products.filter(p => p.id !== id) };
  saveState(newState);
  return newState;
}

// ===== KASa İŞLEM CRUD =====
export function addTransaction(state: AppState, transaction: Omit<Transaction, 'id' | 'createdAt'>): AppState {
  const newTx: Transaction = { ...transaction, id: generateId(), createdAt: new Date().toISOString() };
  const newState = { ...state, transactions: [newTx, ...state.transactions] };
  saveState(newState);
  return newState;
}

export function deleteTransaction(state: AppState, id: string): AppState {
  const newState = { ...state, transactions: state.transactions.filter(t => t.id !== id) };
  saveState(newState);
  return newState;
}

// ===== CARİ CRUD =====
export function addCurrent(state: AppState, current: Omit<Current, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newCurrent: Current = { ...current, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const newState = { ...state, currents: [...state.currents, newCurrent] };
  saveState(newState);
  return newState;
}

export function updateCurrent(state: AppState, id: string, updates: Partial<Current>): AppState {
  const newState = { ...state, currents: state.currents.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c) };
  saveState(newState);
  return newState;
}

export function deleteCurrent(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    currents: state.currents.filter(c => c.id !== id),
    currentLedgerEntries: state.currentLedgerEntries.filter(e => e.currentId !== id),
  };
  saveState(newState);
  return newState;
}

// ===== CARİ DEFTER CRUD =====
export function addCurrentLedgerEntry(state: AppState, entry: Omit<CurrentLedgerEntry, 'id' | 'createdAt' | 'bakiye'>): AppState {
  // Önceki bakiyeyi hesapla
  const prevEntries = state.currentLedgerEntries
    .filter(e => e.currentId === entry.currentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const prevBakiye = prevEntries.length > 0 ? prevEntries[prevEntries.length - 1].bakiye : 0;
  const bakiye = prevBakiye + entry.tutar - entry.odeme;

  const newEntry: CurrentLedgerEntry = {
    ...entry,
    id: generateId(),
    bakiye,
    createdAt: new Date().toISOString(),
  };
  const newState = { ...state, currentLedgerEntries: [...state.currentLedgerEntries, newEntry] };
  saveState(newState);
  return newState;
}

export function deleteCurrentLedgerEntry(state: AppState, id: string): AppState {
  const entry = state.currentLedgerEntries.find(e => e.id === id);
  if (!entry) return state;

  // Silinen kayıttan sonraki tüm kayıtların bakiyesini yeniden hesapla
  const remaining = state.currentLedgerEntries.filter(e => e.id !== id);
  const sameCurrentEntries = remaining
    .filter(e => e.currentId === entry.currentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let runningBakiye = 0;
  const recalculated = sameCurrentEntries.map(e => {
    runningBakiye = runningBakiye + e.tutar - e.odeme;
    return { ...e, bakiye: runningBakiye };
  });

  const otherEntries = remaining.filter(e => e.currentId !== entry.currentId);
  const newState = { ...state, currentLedgerEntries: [...otherEntries, ...recalculated] };
  saveState(newState);
  return newState;
}

// ===== SATIŞ =====
export function processSale(state: AppState, sale: Omit<Sale, 'id' | 'createdAt'>): AppState {
  const newSale: Sale = { ...sale, id: generateId(), createdAt: new Date().toISOString() };
  const saleTx: Transaction = {
    id: generateId(),
    type: 'gelir',
    category: 'satis',
    description: `Satış #${newSale.id.substring(0, 8)} (${sale.items.length} ürün)`,
    amount: sale.total,
    paymentMethod: sale.paymentMethod,
    currentId: sale.currentId,
    date: sale.date,
    createdAt: new Date().toISOString(),
  };
  const newState = { ...state, sales: [newSale, ...state.sales], transactions: [saleTx, ...state.transactions] };
  saveState(newState);
  return newState;
}

// ===== HESAPLAMA YARDIMCILARI =====
export function getMonthStats(state: AppState) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTx = state.transactions.filter(t => t.date.startsWith(month));
  const income = monthTx.filter(t => t.type === 'gelir').reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'gider').reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, net: income - expense };
}

export function getTotalCashBalance(state: AppState) {
  const cash = state.transactions.filter(t => t.paymentMethod === 'nakit').reduce((sum, t) => t.type === 'gelir' ? sum + t.amount : sum - t.amount, 0);
  const bank = state.transactions.filter(t => t.paymentMethod !== 'nakit').reduce((sum, t) => t.type === 'gelir' ? sum + t.amount : sum - t.amount, 0);
  return { cash, bank, total: cash + bank };
}

export function getCurrentSummary(state: AppState, currentId: string) {
  const entries = state.currentLedgerEntries.filter(e => e.currentId === currentId);
  const borcTop = entries.reduce((sum, e) => sum + e.tutar, 0);
  const alacakTop = entries.reduce((sum, e) => sum + e.odeme, 0);
  const bakiye = borcTop - alacakTop;
  return { borcTop, alacakTop, bakiye };
}
