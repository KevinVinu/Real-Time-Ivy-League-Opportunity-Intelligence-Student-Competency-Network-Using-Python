from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Recommendation
from .serializers import RecommendationSerializer
from opportunities.models import Opportunity


def generate_recommendations(user):
    """Content-based filtering: match user interests/skills to opportunity domains/tags."""
    profile = getattr(user, 'profile', None)
    if not profile:
        return []

    user_interests = [i.lower() for i in (profile.interests or [])]
    user_skills = [s.lower() for s in (profile.skills or [])]
    user_keywords = user_interests + user_skills

    opportunities = Opportunity.objects.filter(status='open').exclude(
        applications__user=user
    )

    scored = []
    for opp in opportunities:
        score = 0.0
        opp_text = f"{opp.title} {opp.description} {opp.domain} {' '.join(opp.tags)}".lower()

        for kw in user_keywords:
            if kw in opp_text:
                score += 1.0

        # Bonus for domain match
        domain_map = {
            'research': ['research', 'lab', 'science'],
            'fellowship': ['leadership', 'policy', 'global'],
            'internship': ['engineering', 'software', 'business'],
            'scholarship': ['academic', 'gpa', 'merit'],
        }
        for domain, keywords in domain_map.items():
            for kw in keywords:
                if kw in user_keywords and opp.domain == domain:
                    score += 0.5

        if score > 0:
            reason = f"Matches your interests in {', '.join(user_interests[:3]) or opp.domain}"
            scored.append((opp, score, reason))

    scored.sort(key=lambda x: x[1], reverse=True)

    created = []
    for opp, score, reason in scored[:20]:
        rec, _ = Recommendation.objects.update_or_create(
            user=user,
            opportunity=opp,
            defaults={'score': score, 'reason': reason}
        )
        created.append(rec)
    return created


class RecommendationListView(generics.ListAPIView):
    serializer_class = RecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recommendation.objects.filter(
            user=self.request.user
        ).select_related('opportunity').order_by('-score')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_recommendations(request):
    recs = generate_recommendations(request.user)
    return Response({
        'count': len(recs),
        'message': f'Generated {len(recs)} recommendations for you.'
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def mark_viewed(request, pk):
    try:
        rec = Recommendation.objects.get(pk=pk, user=request.user)
        rec.is_viewed = True
        rec.save()
        return Response({'status': 'marked as viewed'})
    except Recommendation.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
