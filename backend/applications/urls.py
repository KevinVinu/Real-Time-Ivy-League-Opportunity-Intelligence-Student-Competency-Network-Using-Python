from django.urls import path
from . import views

urlpatterns = [
    path('', views.ApplicationListCreateView.as_view(), name='applications-list'),
    path('<int:pk>/', views.ApplicationDetailView.as_view(), name='application-detail'),
    path('autofill/', views.AutoFillProfileView.as_view(), name='autofill-profile'),
    path('stats/', views.application_stats, name='application-stats'),
]
