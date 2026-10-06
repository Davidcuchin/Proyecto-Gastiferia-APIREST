from django.contrib import admin
from .models import Servicio

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ('id_servicio', 'servicio', 'especialista', 'reputacion', 'correo_contacto', 'direccion', 'hora_atencion', 'telefono_contacto')
    search_fields = ('servicio', 'correo_contacto')
