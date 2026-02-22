from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import InCoScore, LeaderboardEntry


class InCoScoreSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = InCoScore
        fields = '__all__'
        read_only_fields = ['user', 'total_score', 'gpa_score', 'application_score',
                            'community_score', 'opportunity_match_score', 'profile_score',
                            'rank', 'last_calculated']


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = '__all__'
