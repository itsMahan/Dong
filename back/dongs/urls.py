from django.urls import path
from . import views


app_name = 'dongs'
urlpatterns = [
    path('create', views.DongCreateView.as_view(), name='create_dong'),
    path('delete/<int:pk>', views.DongDeleteView.as_view(), name='delete_dong'),
    path('update/<int:pk>', views.DongUpdateView.as_view(), name='update_dong'),
]