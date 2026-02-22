from rest_framework import generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Opportunity, ScrapingJob
from .serializers import OpportunitySerializer, ScrapingJobSerializer
from .tasks import scrape_opportunities_task


class OpportunityListCreateView(generics.ListCreateAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'university', 'domain']
    ordering_fields = ['deadline', 'created_at', 'views_count']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Opportunity.objects.all()
        domain = self.request.query_params.get('domain')
        university = self.request.query_params.get('university')
        status = self.request.query_params.get('status')
        if domain:
            qs = qs.filter(domain=domain)
        if university:
            qs = qs.filter(university__icontains=university)
        if status:
            qs = qs.filter(status=status)
        return qs


class OpportunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Opportunity.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def trigger_scraping(request):
    url = request.data.get('url')
    university = request.data.get('university', 'Unknown')
    if not url:
        return Response({'error': 'URL required'}, status=400)
    job = ScrapingJob.objects.create(source_url=url, university=university)
    scrape_opportunities_task.delay(job.id)
    return Response({'message': 'Scraping job started', 'job_id': job.id})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def opportunity_stats(request):
    total = Opportunity.objects.count()
    by_domain = {}
    for d, _ in Opportunity.DOMAIN_CHOICES:
        by_domain[d] = Opportunity.objects.filter(domain=d).count()
    return Response({'total': total, 'by_domain': by_domain})
