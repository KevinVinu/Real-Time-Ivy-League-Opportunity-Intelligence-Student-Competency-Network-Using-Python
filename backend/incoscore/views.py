from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import InCoScore, LeaderboardEntry
from .serializers import InCoScoreSerializer, LeaderboardEntrySerializer

User = get_user_model()


class MyScoreView(generics.RetrieveAPIView):
    serializer_class = InCoScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        score, _ = InCoScore.objects.get_or_create(user=self.request.user)
        return score


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def recalculate_score(request):
    score, _ = InCoScore.objects.get_or_create(user=request.user)
    new_score = score.calculate()
    # Update leaderboard
    _update_leaderboard()
    return Response({'score': new_score, 'details': InCoScoreSerializer(score).data})


def _update_leaderboard():
    scores = InCoScore.objects.order_by('-total_score').select_related('user')
    for rank, score in enumerate(scores, start=1):
        score.rank = rank
        score.save(update_fields=['rank'])
        LeaderboardEntry.objects.update_or_create(
            user=score.user,
            category='global',
            period='all_time',
            defaults={'rank': rank, 'score': score.total_score}
        )


class GlobalLeaderboardView(generics.ListAPIView):
    serializer_class = LeaderboardEntrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        category = self.request.query_params.get('category', 'global')
        period = self.request.query_params.get('period', 'all_time')
        return LeaderboardEntry.objects.filter(
            category=category, period=period
        ).select_related('user').order_by('rank')[:100]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    score, _ = InCoScore.objects.get_or_create(user=user)
    total_users = User.objects.count()
    rank = score.rank or total_users
    return Response({
        'incoscore': score.total_score,
        'rank': rank,
        'total_users': total_users,
        'percentile': round((1 - rank / max(total_users, 1)) * 100, 1),
        'breakdown': {
            'gpa': score.gpa_score,
            'applications': score.application_score,
            'community': score.community_score,
            'opportunity_match': score.opportunity_match_score,
            'profile': score.profile_score,
        }
    })
