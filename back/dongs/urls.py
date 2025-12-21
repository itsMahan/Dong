from django.urls import path
from . import views


app_name = 'dongs'
urlpatterns = [
    path('list/', views.DongListView.as_view(), name='list_dongs'),
    path('create/', views.DongCreateView.as_view(), name='create_dong'),
    path('delete/<int:pk>/', views.DongDeleteView.as_view(), name='delete_dong'),
    path('update/<int:pk>/', views.DongUpdateView.as_view(), name='update_dong'),

    path('member/add/', views.AddDongMemberView.as_view(), name='add_member'),
    path('member/delete/<int:dong_id>/<str:member_name>/', views.DeleteDongMember.as_view(), name='delete_member'),

    path('expenses/list/<int:dong_id>/', views.ExpenseListView.as_view(), name='list_expenses'),
    path('expense/add/<int:dong_id>/', views.AddExpenseView.as_view(), name='add_expense'),
    path('expense/update/<int:pk>/', views.UpdateExpenseView.as_view(), name='update_expense'),
    path('expense/delete/<int:pk>/', views.DeleteExpenseView.as_view(), name='delete_expense'),

    path('expense_participant/add/', views.AddExpenseParticipantView.as_view(), name='add_expense_participant'),

    # گزارش‌ها
    path('balance/<int:dong_id>/', views.BalanceView.as_view(), name='balance'),
    path('settlement/<int:dong_id>/', views.SettlementView.as_view(), name='settlement'),
    path('member-detail/<int:dong_id>/<str:member_name>/', views.MemberDetailView.as_view(), name='member_detail'),
]