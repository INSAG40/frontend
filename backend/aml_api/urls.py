from django.urls import path
from .views import RegisterAPI, LoginAPI, UserAPI, TransactionListCreateAPI, TransactionRetrieveUpdateDestroyAPI, ExportAllTransactionsCSV

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('user/', UserAPI.as_view(), name='user'),
    path('transactions/', TransactionListCreateAPI.as_view(), name='transaction-list-create'),
    path('transactions/<str:pk>/', TransactionRetrieveUpdateDestroyAPI.as_view(), name='transaction-detail'),
    path('export-all-transactions-csv/', ExportAllTransactionsCSV.as_view(), name='export-all-transactions-csv'),
]
