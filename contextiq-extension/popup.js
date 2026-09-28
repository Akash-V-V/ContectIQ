const API_URL = 'http://localhost:3001/api/v1';

let selectedAction = null;
let accessToken = null;

// On load — check if already logged in
chrome.storage.local.get(['accessToken', 'userEmail'], (data) => {
  if (data.accessToken) {
    accessToken = data.accessToken;
    showApp(data.userEmail);
  } else {
    showLogin();
  }
});

function showLogin() {
  document.getElementById('login-view').style.display = 'block';
  document.getElementById('app-view').style.display = 'none';
}

function showApp(email) {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'block';
  document.getElementById('user-email').textContent = email || '';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_SELECTION' }, (response) => {
      if (response?.text) {
        document.getElementById('input').value = response.text;
      }
    });
  });
}

// Sign in
document.getElementById('btn-signin').addEventListener('click', async () => {
  await handleAuth('signin');
});

// Sign up
document.getElementById('btn-signup').addEventListener('click', async () => {
  await handleAuth('signup');
});

async function handleAuth(type) {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorBox = document.getElementById('auth-error');
  errorBox.style.display = 'none';

  if (!email || !password) {
    errorBox.style.display = 'block';
    errorBox.textContent = 'Please enter email and password.';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.style.display = 'block';
      errorBox.textContent = data.message || 'Something went wrong.';
      return;
    }

    if (type === 'signup') {
      errorBox.style.display = 'block';
      errorBox.style.color = '#4ade80';
      errorBox.textContent = 'Account created! Please sign in.';
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      return;
    }

    accessToken = data.accessToken;
    chrome.storage.local.set({ accessToken: data.accessToken, userEmail: data.user.email });
    showApp(data.user.email);

  } catch (err) {
    errorBox.style.display = 'block';
    errorBox.textContent = 'Could not reach the server.';
  }
}

// Sign out
document.getElementById('btn-signout').addEventListener('click', () => {
  chrome.storage.local.remove(['accessToken', 'userEmail']);
  accessToken = null;
  showLogin();
});

// Settings toggle
document.getElementById('btn-settings').addEventListener('click', () => {
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('settings-view').style.display = 'block';
});

document.getElementById('btn-back').addEventListener('click', () => {
  document.getElementById('settings-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'block';
  document.getElementById('password-msg').style.display = 'none';
  document.getElementById('new-password').value = '';
});

// Update password
document.getElementById('btn-update-password').addEventListener('click', async () => {
  const newPassword = document.getElementById('new-password').value.trim();
  const msgBox = document.getElementById('password-msg');

  if (!newPassword || newPassword.length < 6) {
    msgBox.style.display = 'block';
    msgBox.className = 'result-box error';
    msgBox.textContent = 'Password must be at least 6 characters.';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();
    msgBox.style.display = 'block';

    if (!res.ok) {
      msgBox.className = 'result-box error';
      msgBox.textContent = data.message || 'Something went wrong.';
    } else {
      msgBox.className = 'result-box';
      msgBox.style.color = '#4ade80';
      msgBox.textContent = 'Password updated successfully!';
      document.getElementById('new-password').value = '';
    }
  } catch (err) {
    msgBox.style.display = 'block';
    msgBox.className = 'result-box error';
    msgBox.textContent = 'Could not reach the server.';
  }
});

// Action button selection
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-action]').forEach(b => b.style.outline = 'none');
    btn.style.outline = '2px solid #7c6af7';
    selectedAction = btn.dataset.action;
    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-run').textContent = `Run: ${selectedAction}`;
  });
});

// Run action
document.getElementById('btn-run').addEventListener('click', async () => {
  const content = document.getElementById('input').value.trim();
  if (!content || !accessToken) return;

  const resultBox = document.getElementById('result');
  const runBtn = document.getElementById('btn-run');

  resultBox.style.display = 'block';
  resultBox.className = 'result-box';
  resultBox.textContent = 'Thinking...';
  runBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/ai/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: selectedAction, content }),
    });

    const data = await res.json();

    if (res.status === 401) {
      chrome.storage.local.remove(['accessToken', 'userEmail']);
      showLogin();
      return;
    }

    if (!res.ok) {
      resultBox.className = 'result-box error';
      resultBox.textContent = data.message || 'Something went wrong.';
    } else {
      resultBox.textContent = data.result;
      document.getElementById('usage').textContent =
        `${data.usage.remaining} actions remaining this month`;
    }
  } catch (err) {
    resultBox.className = 'result-box error';
    resultBox.textContent = 'Could not reach the API. Is the server running?';
  } finally {
    runBtn.disabled = false;
  }
});