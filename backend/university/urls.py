from django.urls import path
from .views import university_list

urlpatterns = [
    path("universities/", university_list, name="university_list"),
]