import requests

url = 'http://localhost:8000/api/login/'
payload = {'email': 'admin@example.com', 'password': 'admin@123'}
resp = requests.post(url, json=payload)
print(resp.status_code)
print(resp.text)
