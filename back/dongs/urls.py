from django.urls import path
from . import views


app_name = 'dongs'
urlpatterns = [
    path('create/', views.DongCreateView.as_view(), name='create_dong'),
    path('delete/<int:pk>/', views.DongDeleteView.as_view(), name='delete_dong'),
    path('update/<int:pk>/', views.DongUpdateView.as_view(), name='update_dong'),

    path('member/add/', views.AddDongMemberView.as_view(), name='add_member'),
    path('member/delete/<int:dong_id>/<str:member_name>/', views.DeleteDongMember.as_view(), name='delete_member'),
]