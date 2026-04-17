from rest_framework import serializers
from .models import Contact, Admin

class ContactSerializer(serializers.ModelSerializer):
    # Image fields go HERE (inside the Serializer, but OUTSIDE Meta)
    front_card = serializers.ImageField(required=False)
    back_card = serializers.ImageField(required=False)

    class Meta:
        model = Contact
        fields = '__all__'


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['name', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}