from django.shortcuts import render
from rest_framework import generics 
from .models import Message 
from .serializers import MessageSerializer 


# Create your views here.


class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.all().order_by("created_at")
    serializer_class = MessageSerializer


    def perform_create(self, serializer):
        if self.request.user.is_authenticated: 
            serializer.save(user=self.request.user)
        else:
            serializer.save()