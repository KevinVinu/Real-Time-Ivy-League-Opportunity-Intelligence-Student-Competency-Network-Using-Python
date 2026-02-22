from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import StudentProfile

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'university', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'university']
    search_fields = ['email', 'username']


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'gpa', 'major', 'graduation_year', 'profile_completeness']
    search_fields = ['user__email']
