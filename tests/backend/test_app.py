import json
import os
import sys
import unittest


sys.path.append(os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../../')))

from app import app  # Now Python can find your main app file flawlessly!


class TestSaaSBackend(unittest.TestCase):
    def setUp(self):
        # Set up a clean Flask test client instance
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_homepage_loads(self):
        # Verify that hitting the root URL serves our main HTML file properly
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_api_metrics_endpoint(self):
        # Verify that our JSON data endpoints deliver required application components
        response = self.client.get('/api/metrics')
        self.assertEqual(response.status_code, 200)

        # Parse the JSON response
        data = json.loads(response.data)

        # Verify all required data keys exist
        self.assertIn('mrr', data)
        self.assertIn('active_users', data)
        self.assertIn('ltv_cac', data)
        self.assertIn('timeline', data)
        self.assertIn('churn', data)
        self.assertIn('invoices', data)

        # Verify timeline list matches the 12 month array expectation
        self.assertEqual(len(data['timeline']), 12)


if __name__ == '__main__':
    unittest.main()
