(function () {
  window.LF = window.LF || {};

  document.addEventListener('DOMContentLoaded', function () {
    const grid = document.querySelector('#itemsGrid, #categoryGrid, .items-grid, .listings-grid');
    if (!grid || grid.children.length > 0) return;

    const items = (window.LF.getItems ? window.LF.getItems() : []).slice(0, 6);
    if (!items.length) {
      window.LF.emptyState && window.LF.emptyState(grid, 'No category items available.');
      return;
    }

    grid.innerHTML = items.map(function (item) {
      return '<article class="item-card">' +
        '<div class="item-status ' + item.status + '">' + item.status + '</div>' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.description + '</p>' +
        '<span>' + item.location + '</span>' +
      '</article>';
    }).join('');
  });

  console.info('[LEGACY] lf-category-loader loaded');
}());
