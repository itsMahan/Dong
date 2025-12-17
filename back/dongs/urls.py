from django.urls import path
from . import views


app_name = 'dongs'
urlpatterns = [
    path('create', views.DongCreateView.as_view(), name='create_dong'),
]