from rest_framework import serializers
from .models import Opportunity, ScrapingJob


class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = '__all__'
        read_only_fields = ['views_count', 'created_at', 'updated_at']


class ScrapingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrapingJob
        fields = '__all__'
        read_only_fields = ['status', 'opportunities_found', 'started_at', 'completed_at']
