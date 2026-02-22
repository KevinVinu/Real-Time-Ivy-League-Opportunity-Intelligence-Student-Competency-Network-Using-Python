from django.db import models
from accounts.models import User
from opportunities.models import Opportunity


class Application(models.Model):
    STATUS_CHOICES = [
        ('saved', 'Saved'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='saved')
    notes = models.TextField(blank=True)
    essay = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'opportunity']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} → {self.opportunity.title[:40]}"


class AutoFillProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='autofill')
    full_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    personal_statement = models.TextField(blank=True)
    research_experience = models.TextField(blank=True)
    extracurriculars = models.TextField(blank=True)
    references = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - AutoFill"
