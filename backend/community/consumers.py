import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_slug = self.scope['url_route']['kwargs']['room_slug']
        self.room_group_name = f'chat_{self.room_slug}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'system',
            'message': f'Connected to {self.room_slug}'
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        user = self.scope['user']

        if user.is_authenticated and message.strip():
            msg = await self.save_message(user, message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': user.email,
                    'username': user.username,
                    'timestamp': msg.created_at.isoformat(),
                    'msg_id': msg.id,
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'user': event['user'],
            'username': event['username'],
            'timestamp': event['timestamp'],
            'msg_id': event['msg_id'],
        }))

    @database_sync_to_async
    def save_message(self, user, content):
        from community.models import ChatRoom, ChatMessage
        room = ChatRoom.objects.get(slug=self.room_slug)
        return ChatMessage.objects.create(room=room, author=user, content=content)
