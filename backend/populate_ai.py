import os
import django
import random
os.environ.setdefault('DJANGO_SETTINGS_MODULE','jeevandhara.settings')
django.setup()

from medical_cases.models import MedicalCase

count=0
for c in MedicalCase.objects.filter(ai_score=0):
    c.ai_score = random.randint(60,95)
    c.save()
    count+=1
print('updated', count, 'cases')
