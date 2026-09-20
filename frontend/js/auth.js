const AUTH_TOKEN_KEY = 'taskbud_token';
const AUTH_USER_KEY = 'taskbud_user';

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('header-user').classList.add('hidden');
}

function showAppScreen(user) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  document.getElementById('header-user').classList.remove('hidden');
  document.getElementById('username-display').textContent = user.username;
}

// ---- Tab switching ----
document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('login-form').classList.toggle('hidden', target !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', target !== 'register');
  });
});

// ---- Login ----
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('login-status');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  status.textContent = 'Logging in…';
  status.classList.remove('error');
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setSession(data.token, data.user);
    status.textContent = '';
    showAppScreen(data.user);
    window.dispatchEvent(new CustomEvent('taskbud:login'));
  } catch (err) {
    status.textContent = err.message;
    status.classList.add('error');
  }
});

// ---- Register ----
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('register-status');
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  status.textContent = 'Creating account…';
  status.classList.remove('error');
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    setSession(data.token, data.user);
    status.textContent = '';
    showAppScreen(data.user);
    window.dispatchEvent(new CustomEvent('taskbud:login'));
  } catch (err) {
    status.textContent = err.message;
    status.classList.add('error');
  }
});

// ---- Logout ----
document.getElementById('logout-btn').addEventListener('click', () => {
  clearSession();
  showAuthScreen();
});

// ---- On page load: verify any existing token ----
async function initAuth() {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) {
    showAuthScreen();
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Session expired');
    showAppScreen(user);
    window.dispatchEvent(new CustomEvent('taskbud:login'));
  } catch (err) {
    clearSession();
    showAuthScreen();
  }
}

initAuth();
