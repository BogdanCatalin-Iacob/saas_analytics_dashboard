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
        'transactions': transactions
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
