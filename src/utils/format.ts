// Para birimi formatı: 1250.5 -> "1.250,50 ₺"
export function formatCurrency(amount: number, currency = '₺'): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + currency;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export const paymentMethodLabels: Record<string, string> = {
  nakit: 'Nakit',
  kredi_karti: 'Kredi Kartı',
  havale_eft: 'Havale / EFT',
};

export const categoryLabels: Record<string, string> = {
  satis: 'Satış',
  tahsilat: 'Tahsilat',
  kira: 'Kira',
  mal_alimi: 'Mal Alımı',
  fatura: 'Fatura',
  maas: 'Maaş',
  diger_gelir: 'Diğer Gelir',
  diger_gider: 'Diğer Gider',
};

export const incomeCategories = ['satis', 'tahsilat', 'diger_gelir'];
export const expenseCategories = ['kira', 'mal_alimi', 'fatura', 'maas', 'diger_gider'];
