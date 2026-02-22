from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/opportunities/', include('opportunities.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/community/', include('community.urls')),
    path('api/incoscore/', include('incoscore.urls')),
    path('api/recommendations/', include('recommendations.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
