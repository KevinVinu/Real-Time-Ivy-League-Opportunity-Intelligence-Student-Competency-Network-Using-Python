from django.db import models
from accounts.models import User
from opportunities.models import Opportunity


class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='recommendations')
    score = models.FloatField(default=0.0)
    reason = models.CharField(max_length=500, blank=True)
    is_viewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']
        unique_together = ['user', 'opportunity']

    def __str__(self):
        return f"{self.user.email} → {self.opportunity.title[:40]} ({self.score:.2f})"
