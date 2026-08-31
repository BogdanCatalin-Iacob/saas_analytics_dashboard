import random

from flask import Flask, jsonify, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/metrics')
def get_metrics():
    # Simulate real-time live data changing for a SaaS company
    mrr = random.randint(42000, 46500)
    active_users = random.randint(1150, 1280)

    # Generate a realistic LTV:CAC ratio score (e.g., 3.42)
    ltv_cac_ratio = round(random.uniform(3.1, 3.8), 2)

    # Generate a full historical 12-month array layout
    historical_timeline = [
        31200, 32500, 34100, 35600, 36800, 38200,
        39100, 40400, 41200, 41900, 42400, mrr
    ]

    # Live Billing data variables
    churn = round(random.uniform(4.0, 6.5), 2)
    outstanding_invoices = random.randint(1200, 4500)
    profit_margin = random.randint(72, 79)

    # Static ledger simulation matching real financial states
    invoices = [
        {"id": "INV-2026-001", "client": "Global Tech Corp",
         "date": "Aug 28, 2026", "amount": "$4,500.00", "status": "Paid"},
        {"id": "INV-2026-002", "client": "StripeFlow Ltd",
         "date": "Aug 25, 2026", "amount": "$1,200.00", "status": "Paid"},
        {"id": "INV-2026-003", "client": "Alpha Omega AI",
         "date": "Aug 20, 2026", "amount": "$9,800.00", "status": "Overdue"},
        {"id": "INV-2026-004", "client": "HypeBeast Digital",
         "date": "Aug 15, 2026", "amount": "$350.00", "status": "Paid"},
        {"id": "INV-2026-005", "client": "CloudScale Inc",
         "date": "Aug 12, 2026", "amount": "$2,100.00", "status": "Overdue"}
    ]
    random.shuffle(invoices)  # shuffle to simulate changes on data refreshes

    # Mock recent transaction list
    transactions = [
        {'id': '#1042', 'user': 'Acme Corp', 'plan': 'Enterprise',
         'amount': '$999', 'status': 'Success'},
        {'id': '#1041', 'user': 'Sarah Jenkins', 'plan': 'Pro Mo',
         'amount': '$49', 'status': 'Success'},
        {'id': '#1040', 'user': 'DevFlow Studio', 'plan': 'Growth Yr',
         'amount': '$299', 'status': 'Success'},
    ]

    # Randomly shuffle transactions
    random.shuffle(transactions)

    return jsonify({
        'mrr': f'${mrr:,}',
        'active_users': f'{active_users:,}',
        'ltv_cac': f'{ltv_cac_ratio}x',
        'growth': f'{round(random.uniform(2.5, 6.8), 1)}%',
        'timeline': historical_timeline,
        'transactions': transactions,
        # Send Billing variables
        'churn': f'{churn}%',
        'outstanding': f'${outstanding_invoices:,}',
        'margin': f'{profit_margin}%',
        'invoices': invoices
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
