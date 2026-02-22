from django.urls import path
from . import views

urlpatterns = [
    path('', views.OpportunityListCreateView.as_view(), name='opportunities-list'),
    path('<int:pk>/', views.OpportunityDetailView.as_view(), name='opportunity-detail'),
    path('scrape/', views.trigger_scraping, name='trigger-scraping'),
    path('stats/', views.opportunity_stats, name='opportunity-stats'),
]
