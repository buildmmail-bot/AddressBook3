from django.urls import path
from .views import contact_list, contact_detail,admin_list,login_view,register_admin, admin_detail, password_reset,clear_card

urlpatterns = [
    path('contacts/', contact_list),
    path('contacts/<int:id>/clear-card/', clear_card),            
    path('contacts/<int:id>/', contact_detail),
    path('login/', login_view),
    path('register-admin/', register_admin),
    # path('admins/', login_view, name='admin-login'),
    path('admins/', admin_list, name='admin-list'),
    path('password-reset/', password_reset),
    path('admins/<int:pk>/', admin_detail, name='admin-detail'),
]