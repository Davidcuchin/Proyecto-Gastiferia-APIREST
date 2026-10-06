from django.contrib import admin
from django.urls import include, path
from gasfiteria import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/token/', views.obtener_token, name='token'),
    path('api/token/refresh/', views.renovar_token, name='token_refresh'),
    path('gasfiteria/', include('gasfiteria.urls')),
]
