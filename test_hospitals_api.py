import urllib.request
import json

url = 'http://localhost:8000/api/hospitals/'
req = urllib.request.Request(url)
req.add_header('Authorization', 'Bearer dummytoken')

try:
    with urllib.request.urlopen(req) as response:
        print('Status Code:', response.status)
        data = json.loads(response.read().decode())
        print('Response:', json.dumps(data, indent=2)[:1000])
except Exception as e:
    print('Error:', type(e).__name__, str(e)[:500])
