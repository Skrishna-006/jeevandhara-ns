from django.urls import path
from .views import hospital_list

urlpatterns = [
    path('hospitals/', hospital_list, name='hospital_list'),
]
