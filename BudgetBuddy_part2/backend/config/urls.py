from django.contrib import admin
from django.urls import include, path
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.analytics.summary import DashboardSummaryView
from apps.profiles.views import MyProfileView


class HealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok", "project": "BudgetBuddy API"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthView.as_view(), name="health"),
    path("api/auth/", include("apps.authentication.urls")),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/profiles/me/", MyProfileView.as_view(), name="my-profile"),
    path("api/expenses/", include("apps.expenses.urls")),
    path("api/incomes/", include("apps.incomes.urls")),
    path("api/budgets/", include("apps.budgets.urls")),
    path("api/dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]
