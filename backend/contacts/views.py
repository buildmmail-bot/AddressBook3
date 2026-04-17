from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Contact
import json
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework import status
from django.db.models import Q  # <--- Add this line

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Admin
from .serializers import ContactSerializer, AdminSerializer

# ===================== CONTACT LIST =====================

@csrf_exempt
def contact_list(request):
    if request.method == "GET":
        contacts = Contact.objects.all()
        data = []
        for c in contacts:
            data.append({
                "id": c.id,
                "name": c.name,
                "company_name": c.company_name,
                "address": c.address,
                "phone": c.phone,  # Returns the list
                "emails": c.emails, # Returns the list
                "front_card": c.front_card.url if c.front_card else None,
                "back_card": c.back_card.url if c.back_card else None,
                "github": getattr(c, 'github', ""),
                "linkedin": getattr(c, 'linkedin', ""),
                "website": getattr(c, 'website', ""),
            })
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        if request.content_type and 'multipart' in request.content_type:
            name = request.POST.get("name")
            company_name = request.POST.get("company_name")
            address = request.POST.get("address", "")
            
            # Ensure phone are always saved as a list
            phone_raw = request.POST.get("phone")
            if phone_raw:
                phone_val = json.loads(phone_raw)
            else:
                p = request.POST.get("phone")
                phone_val = [p] if p else []

            emails = json.loads(request.POST.get("emails", "[]"))
            front_card = request.FILES.get("front_card")
            back_card = request.FILES.get("back_card")

        else:
            data = json.loads(request.body)
            name = data.get("name")
            company_name = data.get("company_name")
            address = data.get("address", "")
            emails = data.get("emails", [])
            phone_val = data.get("phone", [])
            if not phone_val and data.get("phone"):
                phone_val = [data.get("phone")]
            
            front_card = None
            back_card = None

        contact = Contact.objects.create(
            name=name,
            company_name=company_name,
            address=address,
            phone=phone_val,
            emails=emails,
            front_card=front_card,
            back_card=back_card,
        )

        return JsonResponse({"message": "Saved", "id": contact.id})

# ===================== CONTACT DETAIL =====================

@csrf_exempt
def contact_detail(request, id):
    try:
        contact = Contact.objects.get(id=id)
    except Contact.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)

    if request.method == "DELETE":
        contact.delete()
        return JsonResponse({"message": "Deleted"})

    elif request.method == "PUT":
        data = json.loads(request.body.decode('utf-8'))

        contact.name = data.get("name", contact.name)
        contact.emails = data.get("emails", contact.emails)
        
        # Fixed indentation here
        if "phone" in data:
            contact.phone = data.get("phone")
        elif "phone" in data:
            contact.phone = [data.get("phone")]

        contact.company_name = data.get("company_name", contact.company_name)
        contact.address = data.get("address", contact.address)
        contact.pin = data.get("pin", getattr(contact, 'pin', ""))
        contact.github = data.get("github", getattr(contact, 'github', ""))
        contact.linkedin = data.get("linkedin", getattr(contact, 'linkedin', ""))
        contact.website = data.get("website", getattr(contact, 'website', ""))

        contact.save()
        return JsonResponse({"message": "Updated"})



# ===================== LOGIN =====================

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid credentials"}, status=400)

        user = authenticate(username=user_obj.username, password=password)

        if user is not None:
            login(request, user)

            return JsonResponse({
                    "name": user.username,
                "email": user.email
            })
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=400)

    return JsonResponse({"message": "Login endpoint is active"})

# ===================== REGISTER =====================

@csrf_exempt
def register_admin(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        if User.objects.filter(username=email).exists():
            return JsonResponse({"error": "Admin already exists"}, status=400)

        User.objects.create_user(username=email, email=email, password=password)
        return JsonResponse({"message": "Admin added successfully"})

    return JsonResponse({"message": "Register endpoint active"})





@api_view(['GET', 'POST'])
def admin_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        admins = Admin.objects.filter(
            Q(name__icontains=search) | Q(email__icontains=search)
        ).order_by('-id')
        admins = admins.order_by('-id')
        serializer = AdminSerializer(admins, many=True)
        return Response({'count': admins.count(), 'results': serializer.data})

    if request.method == 'POST':
        serializer = AdminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def admin_detail(request, pk):
    try:
        admin = Admin.objects.get(pk=pk)
    except Admin.DoesNotExist:
        return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminSerializer(admin)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = AdminSerializer(admin, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        admin.delete()
        return Response({'message': 'Admin deleted'}, status=status.HTTP_204_NO_CONTENT)