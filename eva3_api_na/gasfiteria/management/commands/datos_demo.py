from django.core.management.base import BaseCommand
from gasfiteria.models import Servicio, ESPECIALISTAS, DIRECCIONES

class Command(BaseCommand):
    help = 'Agrega tres servicios ficticios, sin reemplazar registros existentes.'

    def handle(self, *args, **options):
        for i, nombre in enumerate(['Reparación de filtraciones', 'Instalación de grifería', 'Mantención de calefón'], 1):
            Servicio.objects.get_or_create(id_servicio=i, defaults={
                'servicio': nombre, 'especialista': ESPECIALISTAS[i][0],
                'reputacion': ['4.8', '4.6', '4.9'][i-1],
                'correo_contacto': f'servicio{i}@example.com',
                'direccion': DIRECCIONES[i-1][0], 'hora_atencion': f'{8+i:02}:00',
                'telefono_contacto': f'+5690000000{i}',
            })
        self.stdout.write('Datos ficticios de demostración disponibles.')
