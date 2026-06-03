(function () {
  window.LF = window.LF || {};

  window.LF.toast = function (message, type) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message || '';
    toast.classList.add('show', type || 'info');
    window.setTimeout(function () {
      toast.classList.remove('show', type || 'info');
    }, 2400);
  };

  window.LF.emptyState = function (target, message) {
    const node = typeof target === 'string' ? document.querySelector(target) : target;
    if (!node) return;
    node.innerHTML = '<div class="empty-state"><h3>No data found</h3><p>' + (message || 'Please try again later.') + '</p></div>';
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-require-auth], [data-require-admin]').forEach(function () {
      window.LF.log && window.LF.log('Auth guard bypassed in frontend preview mode');
    });
  });

  console.info('[LEGACY] lf-ui loaded');
}());
