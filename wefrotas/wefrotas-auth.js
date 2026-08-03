import { account } from '../lib/appwrite.js';

const authState = {
  currentUser: null,
  isChecking: true
};

function getAuthNodes() {
  return {
    gate: document.getElementById('wefrotas-auth-gate'),
    form: document.getElementById('wefrotas-auth-form'),
    email: document.getElementById('wefrotas-auth-email'),
    password: document.getElementById('wefrotas-auth-password'),
    submit: document.getElementById('wefrotas-auth-submit'),
    status: document.getElementById('wefrotas-auth-status'),
    userName: document.getElementById('sidebar-user-name'),
    userAvatar: document.getElementById('sidebar-user-avatar'),
    topbarAvatar: document.getElementById('topbar-avatar')
  };
}

function getUserInitials(user) {
  const label = String(user?.name || user?.email || 'GB').trim();
  const words = label
    .replace(/@.*/, '')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 'GB';
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

function setAuthStatus(message, tone = 'info') {
  const { status } = getAuthNodes();
  if (!status) return;
  status.textContent = message || '';
  status.dataset.tone = tone;
  status.classList.toggle('hidden', !message);
}

function setAuthLoading(isLoading, label = 'Entrar') {
  const { submit } = getAuthNodes();
  if (!submit) return;
  submit.disabled = isLoading;
  submit.textContent = isLoading ? 'Validando acesso...' : label;
}

function applyAuthenticatedUser(user) {
  const { userName, userAvatar, topbarAvatar } = getAuthNodes();
  const displayName = user?.name || user?.email || 'Gestor';
  const initials = getUserInitials(user);
  if (userName) userName.textContent = displayName;
  if (userAvatar) userAvatar.textContent = initials;
  if (topbarAvatar) topbarAvatar.textContent = initials;
}

function unlockWefrotas(user) {
  authState.currentUser = user;
  authState.isChecking = false;
  applyAuthenticatedUser(user);
  document.body.classList.remove('auth-locked', 'auth-checking');
  document.body.classList.add('auth-ready');
  const { gate } = getAuthNodes();
  if (gate) gate.classList.add('hidden');
}

function lockWefrotas(message = '') {
  authState.currentUser = null;
  authState.isChecking = false;
  document.body.classList.add('auth-locked');
  document.body.classList.remove('auth-checking', 'auth-ready');
  const { gate, email } = getAuthNodes();
  if (gate) gate.classList.remove('hidden');
  if (message) setAuthStatus(message, 'error');
  window.setTimeout(() => email?.focus(), 120);
}

async function checkCurrentSession() {
  document.body.classList.add('auth-checking', 'auth-locked');
  setAuthStatus('Verificando sessão...', 'info');
  setAuthLoading(true);
  try {
    const user = await account.get();
    setAuthStatus('', 'info');
    unlockWefrotas(user);
  } catch (error) {
    lockWefrotas('');
  } finally {
    setAuthLoading(false);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const { email, password } = getAuthNodes();
  const emailValue = email?.value.trim() || '';
  const passwordValue = password?.value || '';

  if (!emailValue || !passwordValue) {
    setAuthStatus('Informe e-mail e senha para entrar.', 'error');
    return;
  }

  setAuthLoading(true);
  setAuthStatus('Conectando com o Appwrite...', 'info');

  try {
    await account.createEmailPasswordSession({
      email: emailValue,
      password: passwordValue
    });
    const user = await account.get();
    setAuthStatus('', 'info');
    unlockWefrotas(user);
  } catch (error) {
    const message = error?.message || 'Não foi possível entrar. Confira usuário, senha e plataforma Web no Appwrite.';
    setAuthStatus(message, 'error');
  } finally {
    setAuthLoading(false);
  }
}

async function logoutWefrotas() {
  setAuthStatus('Encerrando sessão...', 'info');
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch (error) {
    console.warn('Não foi possível encerrar a sessão no Appwrite.', error);
  } finally {
    lockWefrotas('Sessão encerrada com segurança.');
  }
}

function bindAuthForm() {
  const { form } = getAuthNodes();
  form?.addEventListener('submit', handleLoginSubmit);
}

window.wefrotasAuth = {
  get currentUser() {
    return authState.currentUser;
  },
  checkCurrentSession,
  logout: logoutWefrotas
};

window.logoutWefrotas = logoutWefrotas;

bindAuthForm();
checkCurrentSession();
