from django.db import models
class Contact(models.Model):
    name = models.CharField(max_length=255, default="New Admin")
    emails = models.JSONField(default=list)
    phone = models.JSONField(default=list)
    company_name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    front_card = models.ImageField(upload_to="cards/front/", blank=True, null=True)
    back_card = models.ImageField(upload_to="cards/back/", blank=True, null=True)



    def __str__(self):
        return self.name
        # --- PASTE THIS CODE BELOW YOUR CONTACT MODEL ---
class Admin(models.Model):
    name = models.CharField(max_length=255, default="New Admin")
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.email