let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
const LIMIT = 1000000;

// ── Chart Setup ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('expenseChart');
const ctx = canvas.getContext('2d');

let chart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['No Data'],
    datasets: [{
      data: [1],
      backgroundColor: ['#e5e7eb']
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  }
});

// ── Dark Mode Toggle ─────────────────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const isDark = localStorage.getItem('darkMode') === 'true';
if (isDark) document.body.classList.add('dark');
themeToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', dark);
  themeToggle.textContent = dark ? '☀️ Light' : '🌙 Dark';
});

// ── Add Custom Category ──────────────────────────────────────────────────────
document.getElementById('addCategoryBtn').addEventListener('click', () => {
  const name = prompt('Nama kategori baru:');
  if (!name || !name.trim()) return;
  const select = document.getElementById('category');
  // Cek duplikat
  const exists = Array.from(select.options).some(o => o.value.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    alert('Kategori sudah ada!');
    return;
  }
  const option = document.createElement('option');
  option.value = name.trim();
  option.textContent = name.trim();
  select.appendChild(option);
  select.value = option.value;
});

// ── Form Submit ──────────────────────────────────────────────────────────────
document.getElementById('expenseForm').onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const amount = parseInt(document.getElementById('amount').value, 10);
  const category = document.getElementById('category').value;

  if (!name || !amount || !category) {
    alert('Semua field harus diisi!');
    return;
  }

  transactions.push({ id: Date.now(), name, amount, category });
  localStorage.setItem('transactions', JSON.stringify(transactions));
  render();
  e.target.reset();
};

// ── Sort ─────────────────────────────────────────────────────────────────────
document.getElementById('sortBy').addEventListener('change', render);

function getSorted() {
  const sortBy = document.getElementById('sortBy').value;
  const copy = [...transactions];
  if (sortBy === 'newest')      return copy.reverse();
  if (sortBy === 'amount-high') return copy.sort((a, b) => b.amount - a.amount);
  if (sortBy === 'amount-low')  return copy.sort((a, b) => a.amount - b.amount);
  if (sortBy === 'category')    return copy.sort((a, b) => a.category.localeCompare(b.category));
  return copy;
}

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  const listEl    = document.getElementById('transactionList');
  const totalEl   = document.getElementById('totalBalance');
  const warningEl = document.getElementById('limitWarning');

  // 1. Hitung total
  const total = transactions.reduce((a, b) => a + b.amount, 0);
  totalEl.textContent = `Total: Rp ${total.toLocaleString('id-ID')}`;

  // 2. Tampilkan peringatan limit
  if (warningEl) warningEl.classList.toggle('hidden', total <= LIMIT);

  // 3. Render list (dengan sorting)
  listEl.innerHTML = '';
  const catTotals = {};

  // Hitung catTotals dari semua transaksi (bukan hanya yg disortir)
  transactions.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  // Tampilkan list sesuai urutan sort
  getSorted().forEach(t => {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.setAttribute('role', 'listitem');

    // Buat elemen secara manual agar aman dari XSS
    const info = document.createElement('div');

    const strong = document.createElement('strong');
    strong.textContent = t.name; // textContent aman dari XSS

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${t.category} • Rp ${t.amount.toLocaleString('id-ID')}`;

    info.appendChild(strong);
    info.appendChild(meta);

    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.textContent = 'Hapus';
    btn.setAttribute('aria-label', `Hapus ${t.name}`);
    btn.addEventListener('click', () => deleteItem(t.id));

    div.appendChild(info);
    div.appendChild(btn);
    listEl.appendChild(div);
  });

  // 4. Update chart
  const COLORS = ['#4f46e5','#06b6d4','#f59e0b','#10b981','#f43f5e','#8b5cf6','#ec4899'];
  if (Object.keys(catTotals).length > 0) {
    chart.data.labels = Object.keys(catTotals);
    chart.data.datasets[0].data = Object.values(catTotals);
    chart.data.datasets[0].backgroundColor = Object.keys(catTotals).map((_, i) => COLORS[i % COLORS.length]);
  } else {
    chart.data.labels = ['No Data'];
    chart.data.datasets[0].data = [1];
    chart.data.datasets[0].backgroundColor = ['#e5e7eb'];
  }
  chart.update();
}

// ── Delete ───────────────────────────────────────────────────────────────────
function deleteItem(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  render();
}

// ── Init ─────────────────────────────────────────────────────────────────────
render();
