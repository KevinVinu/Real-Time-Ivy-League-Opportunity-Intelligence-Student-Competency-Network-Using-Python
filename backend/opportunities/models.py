from django.db import models
from accounts.models import User


class Opportunity(models.Model):
    DOMAIN_CHOICES = [
        ('research', 'Research'),
        ('fellowship', 'Fellowship'),
        ('internship', 'Internship'),
        ('scholarship', 'Scholarship'),
        ('conference', 'Conference'),
        ('competition', 'Competition'),
        ('grant', 'Grant'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('upcoming', 'Upcoming'),
    ]

    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    university = models.CharField(max_length=200)
    domain = models.CharField(max_length=50, choices=DOMAIN_CHOICES, default='other')
    deadline = models.DateField(null=True, blank=True)
    url = models.URLField(max_length=1000)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    tags = models.JSONField(default=list)
    requirements = models.TextField(blank=True)
    stipend = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.university}"


class ScrapingJob(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    source_url = models.URLField(max_length=1000)
    university = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    opportunities_found = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.university} - {self.status}"
