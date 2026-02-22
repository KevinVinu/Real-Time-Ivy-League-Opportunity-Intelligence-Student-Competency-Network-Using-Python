from rest_framework import serializers
from .models import Application, AutoFillProfile
from opportunities.serializers import OpportunitySerializer


class ApplicationSerializer(serializers.ModelSerializer):
    opportunity_detail = OpportunitySerializer(source='opportunity', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AutoFillProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoFillProfile
        fields = '__all__'
        read_only_fields = ['user', 'updated_at']
