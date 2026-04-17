from django.urls import path
from .views import contact_list, contact_detail,admin_list,login_view,register_admin, admin_detail

urlpatterns = [
    path('contacts/', contact_list),             # GET + POST
    path('contacts/<int:id>/', contact_detail),# DELETE
    path('login/', login_view),
    path('register-admin/', register_admin),
    # path('admins/', login_view, name='admin-login'),
    path('admins/', admin_list, name='admin-list'),
]