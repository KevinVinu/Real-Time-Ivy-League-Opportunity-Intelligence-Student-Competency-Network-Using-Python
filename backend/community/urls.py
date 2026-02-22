from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.PostListCreateView.as_view(), name='posts-list'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like/', views.toggle_post_like, name='post-like'),
    path('posts/<int:post_pk>/comments/', views.CommentListCreateView.as_view(), name='post-comments'),
    path('chat/rooms/', views.ChatRoomListView.as_view(), name='chat-rooms'),
    path('chat/<slug:slug>/history/', views.ChatMessageHistoryView.as_view(), name='chat-history'),
]
