// Kullanıcı listesi — şifreleri değiştirmek isterseniz söyleyin
export interface User {
  id: string;
  username: string;
  displayName: string;
  password: string;
  role: 'admin' | 'user';
}

export const USERS: User[] = [
  { id: '1', username: 'sahin',    displayName: 'Şahin',     password: 'Sahin2024!',  role: 'admin' },
  { id: '2', username: 'kullanici2', displayName: 'Kullanıcı 2', password: 'Finans2024!', role: 'user'  },
  { id: '3', username: 'kullanici3', displayName: 'Kullanıcı 3', password: 'Finans2025!', role: 'user'  },
  { id: '4', username: 'kullanici4', displayName: 'Kullanıcı 4', password: 'Finans2026!', role: 'user'  },
];

const SESSION_KEY = 'finans_pro_session';

export function login(username: string, password: string): User | null {
  const user = USERS.find(
    u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
  );
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, loggedAt: Date.now() }));
  }
  return user ?? null;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return USERS.find(u => u.id === userId) ?? null;
  } catch {
    return null;
  }
}
