const ctx = document.getElementById('revenueChart').getContext('2d');
const tierCtx = document.getElementById('tierChart').getContext('2d');

// Initialize Doughnut chart
const tierChart = new Chart(tierCtx, {
    type: 'doughnut',
    data: {
        labels: ['Starter', 'Pro', 'Enterprise'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#60a5fa', '#3b82f6', '#1d4ed8'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#9ca3af', font: { size: 11 } }
            }
        }
    }
});

// initialize Line Chart
const revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'MRR Growth ($)',
            data: [31200, 32500, 34100, 35600, 36800, 38200, 39100, 40400, 41200, 41900, 42400, 0], // Replaced empty array with 12 item array template placeholder structure
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
            y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } }
        }
    }
});

// Asynchronously pull clean json metric from backend
async function updateDashboard() {
    try {
        const response = await fetch('/api/metrics');
        const data = await response.json();

        // Target and update inside dom elements
        const mrrEl = document.getElementById('mrr-val');
        const usersEl = document.getElementById('users-val');
        const convEl = document.getElementById('conversion-val');
        const growthEl = document.getElementById('growth-val');

        mrrEl.innerText = data.mrr;
        usersEl.innerText = data.active_users; // Will execute flawlessly now that the element exists
        if (convEl) convEl.innerText = data.ltv_cac || '3.42x';
        if (growthEl) growthEl.innerText = `${data.growth} live growth`;

        // Strips Css animation pulse classes once initial data maps
        mrrEl.classList.remove('animate-pulse');
        usersEl.classList.remove('animate-pulse');
        convEl.classList.remove('animate-pulse');

        // Extract numbers and replace the whole 12-month array layout cleanly
        if (data.timeline) {
            revenueChart.data.datasets[0].data = data.timeline;
            revenueChart.update();
        }

        const numericMRR = parseInt(data.mrr.replace(/[^0-9]/g, ''));
        const baseMRR = numericMRR || 42000;
        const starterShare = Math.floor(baseMRR * 0.25);
        const proShare = Math.floor(baseMRR * 0.45);
        const enterpriseShare = baseMRR - (starterShare + proShare);

        tierChart.data.datasets[0].data = [starterShare, proShare, enterpriseShare];
        tierChart.update();

        // Clear and rewrite transaction table listings cleanly
        const feed = document.getElementById('transaction-feed');
        feed.innerHTML = '';
        data.transactions.forEach(tx => {
            feed.innerHTML += `
                <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg border border-gray-800 text-sm">
                    <div>
                        <p class="font-medium text-white">${tx.user}</p>
                        <p class="text-xs text-gray-400">${tx.plan} - ${tx.id}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-blue-400">${tx.amount}</p>
                        <span class="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">${tx.status}</span>
                    </div>
                </div>
                `;
        });
    } catch (error) {
        console.error('Error connecting with internal SaaS data endpoints: ', error);
    }
}

// event listeners for polling intervals and clicks
document.getElementById('refresh-btn').addEventListener('click', updateDashboard);
setInterval(updateDashboard, 4000);
updateDashboard();