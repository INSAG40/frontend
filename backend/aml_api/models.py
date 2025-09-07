from django.db import models
from django.contrib.auth.models import User

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('suspicious', 'Suspicious'),
        ('flagged', 'Flagged'),
    ]

    id = models.CharField(max_length=100, unique=True, primary_key=True)
    date = models.DateField()
    from_account = models.CharField(max_length=200)
    to_account = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    risk_score = models.FloatField(default=0.0)
    flags = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='normal')
    # Optionally link to a user if transactions are user-specific
    # user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Transaction {self.id} - {self.amount}"

    def perform_aml_analysis(self):
        # Reset risk score and flags
        self.risk_score = 0.0
        self.flags = []
        self.status = 'normal'

        # Rule 1: Large amount transaction
        if self.amount > 50000:
            self.risk_score += 3.0
            self.flags.append('Large amount transaction')

        # Rule 2: Multiple transactions to the same recipient (this would require checking historical data)
        # For now, we'll simulate it based on a high amount to a specific account
        if self.amount > 20000 and self.to_account == 'ACC-789123':
            self.risk_score += 2.0
            self.flags.append('Multiple transactions to same recipient pattern')

        # Rule 3: Unusual timing (simplified: e.g., on a weekend - this requires more complex date logic)
        # For demonstration, let's say transactions on an odd day of the month are suspicious
        if self.date.day % 2 != 0 and self.amount > 10000:
            self.risk_score += 1.5
            self.flags.append('Unusual timing/pattern')

        # Rule 4: High risk keywords in description
        high_risk_keywords = ['cash', 'loan', 'transfer', 'offshore']
        if any(keyword in self.description.lower() for keyword in high_risk_keywords):
            self.risk_score += 2.5
            self.flags.append('High risk keywords in description')

        # Determine status based on risk score
        if self.risk_score >= 7.0:
            self.status = 'flagged'
        elif self.risk_score >= 4.0:
            self.status = 'suspicious'
        else:
            self.status = 'normal'

        # Cap risk score at 10
        self.risk_score = min(self.risk_score, 10.0)

        self.save()
