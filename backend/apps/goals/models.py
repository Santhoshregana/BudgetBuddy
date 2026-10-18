from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q


class SavingsGoal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="savings_goals")
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    current_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    target_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users_savingsgoal"
        ordering = ["target_date", "name"]
        constraints = [
            models.CheckConstraint(condition=Q(target_amount__gt=0), name="savings_target_positive"),
            models.CheckConstraint(condition=Q(current_amount__gte=0), name="savings_current_nonnegative"),
            models.CheckConstraint(
                condition=Q(current_amount__lte=F("target_amount")),
                name="savings_current_not_over_target",
            ),
        ]

    def __str__(self):
        return self.name
