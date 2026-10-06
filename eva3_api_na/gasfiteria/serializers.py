from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    # La clave se ingresa en el formulario (DATO 1); no es autogenerada.
    id_servicio = serializers.IntegerField(min_value=1, max_value=999999, validators=[UniqueValidator(queryset=Servicio.objects.all())])

    class Meta:
        model = Servicio
        fields = ['id_servicio', 'servicio', 'especialista', 'reputacion',
                  'correo_contacto', 'direccion', 'hora_atencion', 'telefono_contacto']
        extra_kwargs = {field: {'required': True} for field in fields}

    def validate_id_servicio(self, value):
        if self.instance and value != self.instance.pk:
            raise serializers.ValidationError('El identificador no puede cambiar al actualizar.')
        return value
