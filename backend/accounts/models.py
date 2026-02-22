from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    university = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    gpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    major = models.CharField(max_length=200, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    skills = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    target_schools = models.JSONField(default=list)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    profile_completeness = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_completeness(self):
        fields = [self.gpa, self.major, self.graduation_year,
                  self.skills, self.interests, self.user.bio,
                  self.linkedin_url, self.github_url]
        filled = sum(1 for f in fields if f)
        self.profile_completeness = int((filled / len(fields)) * 100)
        self.save(update_fields=['profile_completeness'])
        return self.profile_completeness

    def __str__(self):
        return f"{self.user.email} - Profile"
