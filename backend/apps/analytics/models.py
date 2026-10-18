from django.conf import settings
from django.db import models
from django.db.models import F, Q


class Report(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports")
    title = models.CharField(max_length=120)
    period_start = models.DateField()
    period_end = models.DateField()
    data = models.JSONField(default=dict, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users_report"
        ordering = ["-generated_at"]
        constraints = [
            models.CheckConstraint(condition=Q(period_end__gte=F("period_start")), name="report_end_after_start"),
        ]

    def __str__(self):
        return self.title
