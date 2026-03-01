from django.urls import path
from.views import *
urlpatterns = [path('hospital_info/', HospitalInfoView.as_view(), name='hospital_info'),]