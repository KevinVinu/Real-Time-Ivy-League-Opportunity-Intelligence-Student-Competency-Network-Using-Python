from django.contrib import admin
from .models import InCoScore, LeaderboardEntry


@admin.register(InCoScore)
class InCoScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_score', 'rank', 'last_calculated']
    ordering = ['-total_score']


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ['rank', 'user', 'score', 'category', 'period']
