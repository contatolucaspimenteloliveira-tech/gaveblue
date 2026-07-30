import { account } from '../lib/appwrite.js';

const AUTH_TIMEOUT_MS = 15000;

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

function withTimeout(promise, label) {
  let timeoutId = null;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} demorou mais de ${AUTH_TIMEOUT_MS / 1000}s. Verifique a plataforma Web no Appwrite e a conexao.`));
    }, AUTH_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
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

function getReadableAuthError(error) {
  const message = String(error?.message || '').trim();
  const code = error?.code ? `Codigo ${error.code}: ` : '';
  if (/invalid origin|origin/i.test(message)) {
    return `${code}Origem bloqueada pelo Appwrite. Cadastre gaveblue.com.br e www.gaveblue.com.br em Platforms.`;
  }
  if (/invalid credentials|password|email/i.test(message)) {
    return `${code}E-mail ou senha invalidos. Confira o usuario criado em Auth > Users.`;
  }
  if (/network|failed to fetch|fetch/i.test(message)) {
    return `${code}Falha de rede ao conectar no Appwrite. Confira internet, endpoint e bloqueios do navegador.`;
  }
  return message
    ? `${code}${message}`
    : 'Nao foi possivel entrar. Confira usuario, senha, Auth por e-mail/senha e plataforma Web no Appwrite.';
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
  window.dispatchEvent(new CustomEvent('wefrotas:auth-ready', { detail: { user } }));
}

function lockWefrotas(message = '') {
  authState.currentUser = null;
  authState.isChecking = false;
  document.body.classList.add('auth-locked');
  document.body.classList.remove('auth-checking', 'auth-ready');
  const { gate, email } = getAuthNodes();
  if (gate) gate.classList.remove('hidden');
  if (message) setAuthStatus(message, 'error');
  window.dispatchEvent(new CustomEvent('wefrotas:auth-locked'));
  window.setTimeout(() => email?.focus(), 120);
}

async function checkCurrentSession() {
  document.body.classList.add('auth-checking', 'auth-locked');
  setAuthStatus('Verificando sessao...', 'info');
  setAuthLoading(true);
  try {
    const user = await withTimeout(account.get(), 'Verificacao de sessao');
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
    await withTimeout(account.createEmailPasswordSession({
      email: emailValue,
      password: passwordValue
    }), 'Login');

    setAuthStatus('Sessao criada. Carregando usuario...', 'info');
    const user = await withTimeout(account.get(), 'Carregamento do usuario');
    setAuthStatus('', 'info');
    unlockWefrotas(user);
  } catch (error) {
    console.error('Falha no login Appwrite.', error);
    setAuthStatus(getReadableAuthError(error), 'error');
  } finally {
    setAuthLoading(false);
  }
}

async function logoutWefrotas() {
  setAuthStatus('Encerrando sessao...', 'info');
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch (error) {
    console.warn('Nao foi possivel encerrar a sessao no Appwrite.', error);
  } finally {
    lockWefrotas('Sessao encerrada com seguranca.');
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
