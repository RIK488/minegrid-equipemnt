// /src/utils/auth.ts

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

export function isSeller() {
  const user = getCurrentUser();
  return user?.accountType === 'seller';
}

export function isOwner(ownerId: string) {
  const user = getCurrentUser();
  return user?.id === ownerId;
}
