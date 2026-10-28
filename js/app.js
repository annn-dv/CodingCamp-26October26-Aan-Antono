let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
const LIMIT = 1000000;

let chart = new Chart(document.getElementById('expenseChart'), {
  type: 'pie',
  data: { labels: ['Food','Transport','Fun'], datasets: [{ data:[0,0,0], backgroundColor:['#4f46e5','#06b6d4','#f59e0b'] }] },
  options:{plugins:{legend:{position:'bottom'}}}
});

document.getElementById('expenseForm').onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const amount = parseInt(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  if(!name || !amount) return alert('Semua field harus diisi!');
  
  transactions.push({id:Date.now(), name, amount, category});
  localStorage.setItem('transactions', JSON.stringify(transactions));
  console.log("Transaction added:", name); // <-- ini cara console.log yang benar dari soal tadi
  render();
  e.target.reset();
}

function render(){
  // ... update total, list, dan chart otomatis
  let total = transactions.reduce((a,b)=>a+b.amount,0);
  document.getElementById('totalBalance').textContent = `Total: Rp ${total.toLocaleString('id-ID')}`;
  document.getElementById('limitWarning').classList.toggle('hidden', total <= LIMIT);
  // update list & chart (kode lengkap ada di versi final)
}
render();