from django.contrib import admin
from django.urls import path, include
from chat import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/login/', views.LoginView.as_view(), name='login'),

    # Chat
    path('api/', include('chat.urls')),  # ✅ Includes predict + conversations/
]
