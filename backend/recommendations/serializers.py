from rest_framework import serializers
from opportunities.serializers import OpportunitySerializer
from .models import Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    opportunity = OpportunitySerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = '__all__'
        read_only_fields = ['user', 'score', 'reason', 'created_at']
