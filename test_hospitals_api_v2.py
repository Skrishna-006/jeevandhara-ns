import urllib.request
import json

# First, login to get a token
login_url = 'http://localhost:8000/api/login/'
login_data = json.dumps({
    "username": "testuser",  # This will fail, but let's see what the API returns
    "password": "password123"
}).encode('utf-8')

req = urllib.request.Request(login_url, data=login_data)
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print("Login response:", json.dumps(data, indent=2))
except Exception as e:
    print("Login attempt error (expected):", str(e)[:200])

# Now test the hospitals endpoint without a valid token
print("\n---Testing hospitals endpoint without token---")
url = 'http://localhost:8000/api/hospitals/'
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req) as response:
        print('Status Code:', response.status)
        data = json.loads(response.read().decode())
        print('Response:', json.dumps(data, indent=2)[:500])
except Exception as e:
    print('Error:', type(e).__name__, str(e)[:200])
