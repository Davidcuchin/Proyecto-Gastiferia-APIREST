from django.urls import path
from . import views

urlpatterns = [
    path('', views.servicio_list, name='servicio_list'),
    path('opciones/', views.opciones, name='opciones'),
    path('<int:pk>/', views.servicio_detail, name='servicio_detail'),
]
