from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

ESPECIALISTAS = [
    ('Gasfitería general', 'Gasfitería general'),
    ('Detección de fugas', 'Detección de fugas'),
    ('Instalación sanitaria', 'Instalación sanitaria'),
    ('Mantención de calefón', 'Mantención de calefón'),
    ('Destapes', 'Destapes'),
]
DIRECCIONES = [
    ('Av. Providencia 1200, Providencia', 'Av. Providencia 1200, Providencia'),
    ('Av. Irarrázaval 2400, Ñuñoa', 'Av. Irarrázaval 2400, Ñuñoa'),
    ('San Diego 850, Santiago', 'San Diego 850, Santiago'),
    ('Av. Vicuña Mackenna 7200, La Florida', 'Av. Vicuña Mackenna 7200, La Florida'),
]

class Servicio(models.Model):
    id_servicio = models.PositiveIntegerField(primary_key=True, validators=[MinValueValidator(1), MaxValueValidator(999999)])
    servicio = models.CharField(max_length=100)
    especialista = models.CharField(max_length=60, choices=ESPECIALISTAS)
    reputacion = models.DecimalField(max_digits=2, decimal_places=1, validators=[MinValueValidator(0), MaxValueValidator(5)])
    correo_contacto = models.EmailField(max_length=100)
    direccion = models.CharField(max_length=160, choices=DIRECCIONES)
    hora_atencion = models.TimeField()
    telefono_contacto = models.CharField(max_length=16)

    class Meta:
        ordering = ['id_servicio']
        verbose_name = 'servicio'
        verbose_name_plural = 'servicios'

    def __str__(self):
        return f'{self.id_servicio} · {self.servicio}'
