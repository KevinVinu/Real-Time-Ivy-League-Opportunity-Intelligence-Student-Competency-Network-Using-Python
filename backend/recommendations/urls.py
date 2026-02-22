from django.urls import path
from . import views

urlpatterns = [
    path('', views.RecommendationListView.as_view(), name='recommendations-list'),
    path('refresh/', views.refresh_recommendations, name='recommendations-refresh'),
    path('<int:pk>/viewed/', views.mark_viewed, name='recommendation-viewed'),
]
