from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, PredictView

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path("predict/", PredictView.as_view(), name="predict"),
    path("", include(router.urls)),  # 🟢 conversations/
]
