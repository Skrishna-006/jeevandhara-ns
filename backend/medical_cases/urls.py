from django.urls import path
from .views import (
    medical_cases,
    get_user_medical_cases,
    medical_case_detail,
    medical_case_analysis,
    send_hospital_mail,
    send_university_mail,
)

urlpatterns = [
    # admin list & normal-user create share the same endpoint
    path('medical-cases/', medical_cases, name='medical_cases'),
    path('medical-cases/<int:case_id>/', medical_case_detail, name='medical_case_detail'),
    path('medical-cases/<int:case_id>/analysis/', medical_case_analysis, name='medical_case_analysis'),
    path('medical-cases/my-cases/', get_user_medical_cases, name='get_user_medical_cases'),
    
    # Email workflow endpoints (admin only)
    path('medical-cases/<int:case_id>/send-hospital-mail/', send_hospital_mail, name='send_hospital_mail'),
    path('medical-cases/<int:case_id>/send-university-mail/', send_university_mail, name='send_university_mail'),]