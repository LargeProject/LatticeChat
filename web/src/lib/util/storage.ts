export function setLocalUserId(userId: string) {
  sessionStorage.setItem('userId', userId);
}

export function getLocalUserId() {
  return sessionStorage.getItem('userId');
}

export function setLastUsedEmail(email: string) {
  sessionStorage.setItem('lastUsedEmail', email);
}

export function getLastUsedEmail() {
  return sessionStorage.getItem('lastUsedEmail');
}

export function setLocalJWT(jwt: string) {
  sessionStorage.setItem('jwt', jwt);
}

export function getLocalJWT() {
  return sessionStorage.getItem('jwt');
}
