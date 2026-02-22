from django.db import models
from accounts.models import User


class InCoScore(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='incoscore')
    total_score = models.FloatField(default=0.0)
    gpa_score = models.FloatField(default=0.0)
    application_score = models.FloatField(default=0.0)
    community_score = models.FloatField(default=0.0)
    opportunity_match_score = models.FloatField(default=0.0)
    profile_score = models.FloatField(default=0.0)
    rank = models.IntegerField(null=True, blank=True)
    last_calculated = models.DateTimeField(auto_now=True)

    def calculate(self):
        """
        Weighted scoring:
        GPA (25%) + Applications (20%) + Community (20%) + Opportunity Match (20%) + Profile (15%)
        """
        profile = getattr(self.user, 'profile', None)
        gpa = float(profile.gpa) if profile and profile.gpa else 0.0
        self.gpa_score = min((gpa / 4.0) * 100, 100) * 0.25

        apps = self.user.applications.filter(status='submitted').count()
        self.application_score = min(apps * 10, 100) * 0.20

        posts = self.user.posts.count()
        comments = self.user.comments.count()
        self.community_score = min((posts * 5 + comments * 2), 100) * 0.20

        # Opportunity match: calculated externally, default from recommendations
        self.opportunity_match_score = self.opportunity_match_score * 0.20

        completeness = profile.profile_completeness if profile else 0
        self.profile_score = completeness * 0.15

        self.total_score = (
            self.gpa_score + self.application_score +
            self.community_score + self.opportunity_match_score + self.profile_score
        )
        self.save()
        return self.total_score

    def __str__(self):
        return f"{self.user.email} - {self.total_score:.1f}"


class LeaderboardEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard_entries')
    rank = models.IntegerField()
    score = models.FloatField()
    category = models.CharField(max_length=100, default='global')  # 'global' or school name
    period = models.CharField(max_length=20, default='all_time')  # 'weekly', 'monthly', 'all_time'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['rank']
        unique_together = ['user', 'category', 'period']

    def __str__(self):
        return f"#{self.rank} {self.user.email} ({self.score:.1f})"
