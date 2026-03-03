import requests
url='http://localhost:8000/api/send-otp/'
data={'username':'testuser','email':'test@example.com','password':'testpass123'}
try:
    r=requests.post(url,json=data)
    print('status',r.status_code)
    print(r.text)
except Exception as e:
    print('error',e)
