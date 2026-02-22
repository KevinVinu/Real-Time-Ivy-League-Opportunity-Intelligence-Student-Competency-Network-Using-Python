from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import Application, AutoFillProfile
from .serializers import ApplicationSerializer, AutoFillProfileSerializer


class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            user=self.request.user
        ).select_related('opportunity')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'submitted' and not instance.submitted_at:
            instance.submitted_at = timezone.now()
            instance.save(update_fields=['submitted_at'])


class AutoFillProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = AutoFillProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = AutoFillProfile.objects.get_or_create(user=self.request.user)
        return obj


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def application_stats(request):
    apps = Application.objects.filter(user=request.user)
    stats = {
        'total': apps.count(),
        'by_status': {}
    }
    for status, _ in Application.STATUS_CHOICES:
        stats['by_status'][status] = apps.filter(status=status).count()
    return Response(stats)
