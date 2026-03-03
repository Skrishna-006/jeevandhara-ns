import urllib.request, json

req=urllib.request.Request('http://localhost:8000/api/send-otp/',
                             data=json.dumps({'username':'foo','email':'foo@example.com','password':'barbaz'}).encode(),
                             headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req) as res:
        body=res.read().decode()
        print('status',res.status)
        print('content-type',res.getheader('Content-Type'))
        print(body[:500])
except Exception as e:
    print('err', e)
