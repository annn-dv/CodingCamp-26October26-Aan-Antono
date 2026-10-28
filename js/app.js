let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
const LIMIT = 1000000;

// PASTIKAN canvas sudah ada, pakai getContext
const canvas = document.getElementById('expenseChart');
const ctx = canvas.getContext('2d');

let chart = new Chart(ctx, {
  type: 'pie',
  data: { 
    labels: ['Food','Transport','Fun'], 
    datasets: [{ 
      data: [0,0,0], 
      backgroundColor: ['#4f46e5','#06b6d4','#f59e0b','#10b981','#f43f5e'] 
    }] 
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  }
});

document.getElementById('expenseForm').onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const amount = parseInt(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  
  if(!name || !amount || !category) {
    alert('Semua field harus diisi!');
    return;
  }
  
  transactions.push({id: Date.now(), name, amount, category});
  localStorage.setItem('transactions', JSON.stringify(transactions));
  console.log("Transaction added:", name);
  render();
  e.target.reset();
}

function render(){
  const listEl = document.getElementById('transactionList');
  const totalEl = document.getElementById('totalBalance');
  const warningEl = document.getElementById('limitWarning');

  // 1. Hitung total
  let total = transactions.reduce((a,b) => a + b.amount, 0);
  totalEl.textContent = `Total: Rp ${total.toLocaleString('id-ID')}`;
  
  // 2. Highlight over limit
  if(warningEl) warningEl.classList.toggle('hidden', total <= LIMIT);

  // 3. Render list
  listEl.innerHTML = '';
  const catTotals = {};

  transactions.forEach(t => {
    // Hitung per kategori untuk chart
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;

    // Buat item list
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
      <div>
        <strong>${t.name}</strong>
        <div class="meta">${t.category} • Rp ${t.amount.toLocaleString('id-ID')}</div>
      </div>
      <button class="delete-btn" onclick="deleteItem(${t.id})">Delete</button>
    `;
    listEl.appendChild(div);
  });

  // 4. UPDATE CHART 
  if(Object.keys(catTotals).length > 0) {
    chart.data.labels = Object.keys(catTotals);
    chart.data.datasets[0].data = Object.values(catTotals);
  } else {
    chart.data.labels = ['Food','Transport','Fun'];
    chart.data.datasets[0].data = [0,0,0];
  }
  chart.update();
}

window.deleteItem = (id) => {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  render();
}

// Initial render
render();