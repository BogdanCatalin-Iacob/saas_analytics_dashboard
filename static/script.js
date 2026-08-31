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
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Replaced empty array with 12 item array template placeholder structure
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

// Tab Switching Navigation Logic System
const btnDashboard = document.getElementById('nav-dashboard');
const btnBilling = document.getElementById('nav-billing');
const secDashboard = document.getElementById('section-dashboard');
const secBilling = document.getElementById('section-billing');

btnDashboard.addEventListener('click', () => {
    // Show Dashboard, Hide Billing
    secDashboard.classList.remove('hidden');
    secBilling.classList.add('hidden');
    // Toggle active link visual themes
    btnDashboard.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium cursor-pointer text-left transition";
    btnBilling.className = "w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 rounded-lg font-medium cursor-pointer text-left transition";
});

btnBilling.addEventListener('click', () => {
    // Show Billing, Hide Dashboard
    secBilling.classList.remove('hidden');
    secDashboard.classList.add('hidden');
    // Toggle active link visual themes
    btnBilling.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium cursor-pointer text-left transition";
    btnDashboard.className = "w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 rounded-lg font-medium cursor-pointer text-left transition";
});

// Asynchronously pull clean json metric from backend
async function updateDashboard() {
    try {
        const response = await fetch('/api/metrics');
        const data = await response.json();

        // 1. Map Core Dashboard Metrics
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

        // 2. Map Billing Tab Specific Metrics
        const churnEl = document.getElementById('churn-val');
        const outstandingEl = document.getElementById('outstanding-val');
        const marginEl = document.getElementById('margin-val');

        if (churnEl) {
            churnEl.innerText = data.churn;
            // 1. Assign the text percentage value coming from Python (e.g. "3.42%")
            churnEl.innerText = data.churn;

            // 2. Parse the string value back into a comparative float number
            const numericChurn = parseFloat(data.churn.replace('%', ''));

            // 3. Wipe any existing threshold classes to safely re-evaluate
            churnEl.classList.remove('text-green-400', 'text-red-400');

            // 4. Evaluate against the 5% gold-standard baseline rule
            if (numericChurn < 5.0) {
                churnEl.classList.add('text-green-400'); // Safe, healthy threshold state
            } else {
                churnEl.classList.add('text-red-400');   // Warning state if attrition climbs
            }
        }
        if (outstandingEl && data.invoices) {
            // 1. Filter out only the Overdue invoices, pull their amounts, and clean up the string symbols ($ and commas)
            const totalOverdue = data.invoices
                .filter(inv => inv.status === 'Overdue')
                .reduce((sum, inv) => {
                    const cleanAmount = parseFloat(inv.amount.replace(/[^0-9.]/g, ''));
                    return sum + cleanAmount;
                }, 0);

            // 2. Format the mathematical sum back into a clean currency layout (e.g., $11,900.00)
            outstandingEl.innerText = `$${totalOverdue.toLocaleString('en-US')}`;
        }
        if (marginEl) {
            // 1. Get the raw numeric MRR currently computed from Python
            const currentMRR = parseInt(data.mrr.replace(/[^0-9]/g, '')) || 42000;

            // 2. Simulate core business costs (e.g., base infrastructure costs + variable customer growth expenses)
            const baseOperatingCosts = 8500;
            const marketingCosts = currentMRR * 0.12; // Simulates spending 12% of revenue on ads
            const totalExpenses = baseOperatingCosts + marketingCosts;

            // 3. Apply the Net Profit Margin calculation formula
            const calculatedMargin = ((currentMRR - totalExpenses) / currentMRR) * 100;

            // 4. Format and print the output cleanly (e.g., "71.4%")
            marginEl.innerText = `${calculatedMargin.toFixed(1)}%`;
        }


        // 3. Dynamically Redraw Line and Area Data Tracks
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

        // 4. Map Live Transactions Feed Listings
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
        // 5. NEW: Map Corporate Invoice Ledger Listings Table
        const invoiceTableBody = document.getElementById('invoice-table-body');

        if (invoiceTableBody && data.invoices) {

            // set the count of overdue invoices
            const overdueCount = data.invoices.filter(inv => inv.status === 'Overdue').length;
            const dunningEl = document.getElementById('dunning-count');
            if (dunningEl) {
                dunningEl.innerText = overdueCount > 0
                    ? `⚠️ ${overdueCount} require immediate dunning`
                    : `✅ All invoices healthy`;
            }

            // Populate the invoices table
            invoiceTableBody.innerHTML = '';
            data.invoices.forEach(inv => {
                const statusStyle = inv.status === 'Paid'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20';

                invoiceTableBody.innerHTML += `
                    <tr class="hover:bg-gray-900/40 text-gray-300 transition">
                        <td class="p-4 font-mono font-medium text-xs text-gray-400">${inv.id}</td>
                        <td class="p-4 font-semibold text-white">${inv.client}</td>
                        <td class="p-4 text-gray-400">${inv.date}</td>
                        <td class="p-4 font-bold text-gray-100">${inv.amount}</td>
                        <td class="p-4">
                            <span class="text-xs font-medium px-2 py-0.5 rounded border ${statusStyle}">${inv.status}</span>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error('Error connecting with internal SaaS data endpoints: ', error);
    }
}

// event listeners for polling intervals and clicks
document.getElementById('refresh-btn').addEventListener('click', updateDashboard);
setInterval(updateDashboard, 4000);
updateDashboard();