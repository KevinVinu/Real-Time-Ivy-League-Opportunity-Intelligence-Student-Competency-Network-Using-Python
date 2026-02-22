from django.contrib import admin
from .models import Opportunity, ScrapingJob


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'university', 'domain', 'status', 'is_featured', 'deadline', 'views_count', 'created_at']
    list_filter = ['domain', 'status', 'university']
    search_fields = ['title', 'university', 'description']
    list_editable = ['status', 'is_featured']


@admin.register(ScrapingJob)
class ScrapingJobAdmin(admin.ModelAdmin):
    list_display = ['university', 'source_url', 'status', 'opportunities_found', 'created_at']
    list_filter = ['status']
