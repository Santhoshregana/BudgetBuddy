from django.db.models import Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.budgets.models import Budget
from apps.expenses.models import Expense
from apps.incomes.models import Income
from apps.profiles.models import Profile


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        month_start = today.replace(day=1)
        expenses = Expense.objects.filter(user=request.user, spent_on__gte=month_start, spent_on__lte=today)
        incomes = Income.objects.filter(user=request.user, received_on__gte=month_start, received_on__lte=today)
        expense_total = expenses.aggregate(total=Sum("amount"))["total"] or 0
        income_total = incomes.aggregate(total=Sum("amount"))["total"] or 0
        category_totals = expenses.values("category").annotate(total=Sum("amount")).order_by("category")
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response({
            "month": month_start.strftime("%Y-%m"),
            "currency": profile.currency,
            "income": income_total,
            "expenses": expense_total,
            "net": income_total - expense_total,
            "category_spending": list(category_totals),
            "active_budgets": Budget.objects.filter(user=request.user, start_date__lte=today, end_date__gte=today).count(),
        })
