(function () {
  const fallbackItems = [
    {
      id: 1,
      title: 'Black iPhone 14 Pro',
      description: 'Found near Dhanmondi Lake walkway with a clear case.',
      category: 'Electronics',
      status: 'found',
      location: 'Dhanmondi Lake, Dhaka',
      date: '2026-05-21'
    },
    {
      id: 2,
      title: 'Brown Leather Wallet',
      description: 'Lost wallet containing student ID and cards.',
      category: 'Bags',
      status: 'lost',
      location: 'Bashundhara City, Dhaka',
      date: '2026-05-22'
    },
    {
      id: 3,
      title: 'Silver Key Set',
      description: 'Found three silver keys with a blue tag.',
      category: 'Keys',
      status: 'found',
      location: 'Mirpur 10, Dhaka',
      date: '2026-05-24'
    }
  ];

  const apiBase = window.LEGACY_API_URL || 'http://127.0.0.1:8000/api';

  function log(message, data) {
    if (window.localStorage && window.localStorage.getItem('LF_DIAGNOSTICS') === 'false') return;
    console.info('[LEGACY]', message, data || '');
  }

  function safeJson(response) {
    if (!response.ok) throw new Error(response.statusText || 'Request failed');
    return response.json();
  }

  window.LF = window.LF || {};
  window.LF.items = fallbackItems;
  window.LF.currentUser = window.LF.currentUser || {
    id: 2,
    name: 'Alex Morgan',
    email: 'alex@lostfound.test',
    role: 'user'
  };
  window.LF.apiBase = apiBase;
  window.LF.log = log;
  window.LF.api = function (path, options) {
    return fetch(apiBase + path, {
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      ...(options || {})
    }).then(safeJson).catch(function (error) {
      console.warn('[LEGACY][API] Backend unavailable, using fallback data.', error.message);
      return { items: fallbackItems, conversations: [], messages: [], user: window.LF.currentUser };
    });
  };
  window.LF.requireAuth = function () {
    return true;
  };
  window.LF.requireAdmin = function () {
    return true;
  };
  window.LF.getItems = function () {
    return fallbackItems;
  };
  window.LF.formatDate = function (value) {
    return value || '';
  };

  log('lf-core loaded');
}());
