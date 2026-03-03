import requests

print('sending otp request')
r = requests.post('http://localhost:8000/api/send-otp/', json={'username':'foo','email':'foo@example.com','password':'barbaz'})
print(r.status_code, r.text)
