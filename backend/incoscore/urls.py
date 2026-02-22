from django.urls import path
from . import views

urlpatterns = [
    path('my-score/', views.MyScoreView.as_view(), name='my-score'),
    path('recalculate/', views.recalculate_score, name='recalculate-score'),
    path('leaderboard/', views.GlobalLeaderboardView.as_view(), name='leaderboard'),
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
]
