from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import RegisterSerializer, UserSerializer, LoginSerializer
from .models import Transaction
from .serializers import TransactionSerializer
from django.http import HttpResponse
import csv

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        })

@method_decorator(csrf_exempt, name='dispatch')
class LoginAPI(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        print("\nReceived login request:", request.data)
        serializer = LoginSerializer(data=request.data)
        print(f"Serializer initialized. Is valid: {serializer.is_valid()}")
        print(f"Serializer errors: {serializer.errors}")

        if not serializer.is_valid():
            print("Login Serializer Errors (from .is_valid()):")
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key
            })
        else:
            print("Authentication failed: Invalid credentials for user", username)
            return Response({"error": "Invalid Credentials"}, status=status.HTTP_400_BAD_REQUEST)

class UserAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class TransactionListCreateAPI(generics.ListCreateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not serializer.is_valid(raise_exception=True):
            print("Transaction Serializer Errors:", serializer.errors)
        transaction = serializer.save()
        transaction.perform_aml_analysis()

    def delete(self, request, *args, **kwargs):
        # Delete all transactions
        Transaction.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TransactionRetrieveUpdateDestroyAPI(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        transaction = serializer.save()
        transaction.perform_aml_analysis()


class ExportAllTransactionsCSV(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        transactions = Transaction.objects.all()
        serializer = TransactionSerializer(transactions, many=True)
        
        # Prepare CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="all_transactions_analysis.csv"'

        writer = csv.writer(response)
        writer.writerow(['Transaction ID', 'Date', 'From Account', 'To Account', 'Amount', 'Description', 'Risk Score', 'Status', 'Flags'])

        for transaction_data in serializer.data:
            writer.writerow([
                transaction_data['id'],
                transaction_data['date'],
                transaction_data['from_account'],
                transaction_data['to_account'],
                transaction_data['amount'],
                transaction_data['description'],
                transaction_data['risk_score'],
                transaction_data['status'],
                '; '.join(transaction_data['flags']),
            ])
        return response
