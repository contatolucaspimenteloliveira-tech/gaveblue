const cards = [...document.querySelectorAll('.card')];
const search = document.querySelector('#search');
const filters = [...document.querySelectorAll('[data-filter]')];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
let category = 'Todos';
function updateCatalog() {
  const query = normalize(search.value.trim());
  let count = 0;
  cards.forEach(card => {
    const visible = (category === 'Todos' || card.dataset.category === category) && normalize(card.textContent).includes(query);
    card.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector('#count').textContent = `${count} ${count === 1 ? 'projeto encontrado' : 'projetos encontrados'}`;
  document.querySelector('#empty').hidden = count !== 0;
}
filters.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  updateCatalog();
}));
search.addEventListener('input', updateCatalog);
document.querySelector('#reset').addEventListener('click', () => {
  search.value = '';
  filters[0].click();
  search.focus();
});
updateCatalog();
