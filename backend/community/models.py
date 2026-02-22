from django.db import models
from accounts.models import User


class Post(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('research', 'Research'),
        ('advice', 'Advice'),
        ('opportunity', 'Opportunity Share'),
        ('question', 'Question'),
        ('achievement', 'Achievement'),
    ]
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=300)
    content = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='general')
    tags = models.JSONField(default=list)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    views_count = models.IntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.count()

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.email}: {self.content[:50]}"


class ChatRoom(models.Model):
    ROOM_TYPES = [
        ('general', 'General'),
        ('university', 'University'),
        ('domain', 'Domain'),
        ('private', 'Private'),
    ]
    name = models.CharField(max_length=200)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='general')
    slug = models.SlugField(unique=True)
    members = models.ManyToManyField(User, related_name='chat_rooms', blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.email}: {self.content[:50]}"
