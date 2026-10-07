import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AppState, Product, Transaction, Current, Sale, PaymentMethod } from '../types';
import {
  loadState,
  addProduct,
  updateProduct,
  deleteProduct,
  addTransaction,
  deleteTransaction,
  addCurrent,
  updateCurrent,
  deleteCurrent,
  processSale,
  generateId,
} from '../data/store';

interface AppContextValue {
  state: AppState;
  // Products
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Transactions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  // Currents
  addCurrent: (c: Omit<Current, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCurrent: (id: string, updates: Partial<Current>) => void;
  deleteCurrent: (id: string) => void;
  // Sales
  processSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  generateId: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  const handleAddProduct = useCallback((p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(s => addProduct(s, p));
  }, []);

  const handleUpdateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setState(s => updateProduct(s, id, updates));
  }, []);

  const handleDeleteProduct = useCallback((id: string) => {
    setState(s => deleteProduct(s, id));
  }, []);

  const handleAddTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setState(s => addTransaction(s, t));
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setState(s => deleteTransaction(s, id));
  }, []);

  const handleAddCurrent = useCallback((c: Omit<Current, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(s => addCurrent(s, c));
  }, []);

  const handleUpdateCurrent = useCallback((id: string, updates: Partial<Current>) => {
    setState(s => updateCurrent(s, id, updates));
  }, []);

  const handleDeleteCurrent = useCallback((id: string) => {
    setState(s => deleteCurrent(s, id));
  }, []);

  const handleProcessSale = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    setState(s => processSale(s, sale));
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      addProduct: handleAddProduct,
      updateProduct: handleUpdateProduct,
      deleteProduct: handleDeleteProduct,
      addTransaction: handleAddTransaction,
      deleteTransaction: handleDeleteTransaction,
      addCurrent: handleAddCurrent,
      updateCurrent: handleUpdateCurrent,
      deleteCurrent: handleDeleteCurrent,
      processSale: handleProcessSale,
      generateId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
