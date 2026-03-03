import os
ios
django
import json
import urllib.request

os.environ.setdefault('DJANGO_SETTINGS_MODULE','jeevandhara.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User=get_user_model()
user=User.objects.get(username='ADM-001')
refresh=RefreshToken.for_user(user)
token=str(refresh.access_token)
print('Token for admin', token[:50])
req=urllib.request.Request('http://localhost:8000/api/medical-cases/')
req.add_header('Authorization',f'Bearer {token}')
try:
    with urllib.request.urlopen(req) as res:
        print('cases status', res.status)
        data=json.loads(res.read().decode())
        print('cases count', len(data))
        if data:
            print(data[0])
except Exception as e:
    print('error',e)
