from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from apps.budgets.models import Budget
from apps.expenses.models import Expense
from apps.goals.models import SavingsGoal
from apps.incomes.models import Income
from apps.notifications.models import Notification
from apps.profiles.models import Profile
from apps.analytics.models import Report


class MilestoneSchemaTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="student",
            email="student@example.com",
            password="A-safe-test-password-739!",
        )

    def test_models_are_associated_with_their_owner(self):
        profile = Profile.objects.create(user=self.user, currency="USD")
        income = Income.objects.create(
            user=self.user,
            source="Part-time job",
            amount=Decimal("125.00"),
            received_on=date(2026, 10, 1),
        )
        expense = Expense.objects.create(
            user=self.user,
            category="Books",
            amount=Decimal("45.00"),
            spent_on=date(2026, 10, 2),
        )
        budget = Budget.objects.create(
            user=self.user,
            name="October",
            amount=Decimal("300.00"),
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 31),
        )
        goal = SavingsGoal.objects.create(
            user=self.user,
            name="Emergency fund",
            target_amount=Decimal("1000.00"),
        )
        notification = Notification.objects.create(user=self.user, title="Welcome", message="Getting started")
        report = Report.objects.create(
            user=self.user,
            title="October",
            period_start=date(2026, 10, 1),
            period_end=date(2026, 10, 31),
        )

        self.assertEqual(self.user.profile, profile)
        self.assertEqual(self.user.incomes.get(), income)
        self.assertEqual(self.user.expenses.get(), expense)
        self.assertEqual(self.user.budgets.get(), budget)
        self.assertEqual(self.user.savings_goals.get(), goal)
        self.assertEqual(self.user.notifications.get(), notification)
        self.assertEqual(self.user.reports.get(), report)

    def test_income_amount_must_be_positive(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Income.objects.create(
                    user=self.user,
                    source="Invalid",
                    amount=Decimal("0.00"),
                    received_on=date(2026, 10, 1),
                )

    def test_budget_end_date_cannot_precede_start_date(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Budget.objects.create(
                    user=self.user,
                    name="Invalid",
                    amount=Decimal("100.00"),
                    start_date=date(2026, 10, 31),
                    end_date=date(2026, 10, 1),
                )

    def test_profile_includes_allowance_and_preferences(self):
        profile = Profile.objects.create(
            user=self.user,
            allowance_amount=Decimal("250.00"),
            preferences={"week_starts_on": "monday"},
        )

        self.assertEqual(profile.allowance_amount, Decimal("250.00"))
        self.assertEqual(profile.preferences, {"week_starts_on": "monday"})

    def test_registration_creates_profile(self):
        client = APIClient()
        response = client.post(
            "/api/auth/register/",
            {
                "username": "newstudent",
                "email": "newstudent@example.com",
                "password": "A-different-safe-password-851!",
                "password_confirm": "A-different-safe-password-851!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        registered_user = get_user_model().objects.get(username="newstudent")
        self.assertTrue(Profile.objects.filter(user=registered_user).exists())
