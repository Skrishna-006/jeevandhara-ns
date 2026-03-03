import requests

url = 'http://localhost:8000/api/login/'
payload = {'email': 'admin@example.com', 'password': 'admin@123'}
try:
    r = requests.post(url, json=payload, timeout=5)
    print(r.status_code)
    print(r.text)
except Exception as e:
    print('error', e)
