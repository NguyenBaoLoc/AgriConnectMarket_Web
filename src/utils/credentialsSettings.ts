export type UserCredentials = {
  token?: string;
  userId?: string;
  accountId?: string;
  role?: string;
  farmId?: string;
};

export function setUserCredentials(credentials: UserCredentials) {
  if (credentials.token) {
    localStorage.setItem('token', credentials.token);
  }
  if (credentials.userId) {
    localStorage.setItem('userId', credentials.userId);
  }
  if (credentials.accountId) {
    localStorage.setItem('accountId', credentials.accountId);
  }
  if (credentials.role) {
    localStorage.setItem('role', credentials.role);
  }
  if (credentials.farmId) {
    localStorage.setItem('farmId', credentials.farmId);
  }
}

export function removeCredentials() {
  const keys = ['token', 'userId', 'accountId', 'role', 'farmId'];
  keys.forEach((key) => localStorage.removeItem(key));
}

export function hasValidCredentials(): boolean {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  return !!token && !!userId && !!role;
}
