from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from transformers import pipeline
import os

from .models import Conversation, Message
from .utils import load_disease_data


# 🟢 Register
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=400)
        user = User.objects.create_user(username=username, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})


# 🟢 Login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    authentication_classes = []  # allow unauthenticated access
    permission_classes = []  # allow unauthenticated access

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key})
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


# 🟢 Create a conversation
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework.authentication import TokenAuthentication


from django.utils.timezone import now

from rest_framework import viewsets, permissions
from .models import Conversation
from .serializers import ConversationSerializer
from rest_framework.authentication import TokenAuthentication


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# 🟢 Predict
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TextClassificationPipeline,
)
import os

from .models import Conversation, Message
from .utils import load_disease_data
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers.pipelines import TextClassificationPipeline
import torch

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TextClassificationPipeline,
)
import torch

from transformers import (
    AutoConfig,
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TextClassificationPipeline,
)
import os


class PredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            message = request.data.get("message")
            conv_id = request.data.get("conversation_id")

            # ✅ Step 1: Absolute path to your model folder
            # model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../model"))
            model_path = (
                "/home/tel/Documents/Programming_Project/Graduation-Project/model"
            )

            if not os.path.isdir(model_path) or not os.path.exists(
                os.path.join(model_path, "config.json")
            ):
                return Response(
                    {
                        "error": f"Model path invalid or missing config.json: {model_path}"
                    },
                    status=500,
                )

            # ✅ Step 3: Load config and model locally
            tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
            config = AutoConfig.from_pretrained(model_path, local_files_only=True)
            model = AutoModelForSequenceClassification.from_pretrained(
                model_path, config=config, local_files_only=True
            )

            classifier = TextClassificationPipeline(
                model=model,
                tokenizer=tokenizer,
                return_all_scores=True,
                top_k=3,
                device=-1,
            )

            result = classifier(message)

            # Match with disease JSON
            diseases = load_disease_data()
            matched = []
            for disease_scores in result:
                for r in disease_scores:
                    name = r["label"]
                    match = next(
                        (d for d in diseases if d["name"].lower() == name.lower()), None
                    )
                    if match:
                        match["confidence"] = round(r["score"] * 100, 2)
                        matched.append(match)

            conversation = Conversation.objects.get(id=conv_id, user=request.user)
            Message.objects.create(
                conversation=conversation, is_user=True, text=message
            )
            Message.objects.create(
                conversation=conversation, is_user=False, text=str(matched)
            )

            return Response({"result": matched})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
