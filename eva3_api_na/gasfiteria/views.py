from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import Servicio, ESPECIALISTAS, DIRECCIONES
from .serializers import ServicioSerializer

class LoginThrottle(AnonRateThrottle):
    scope = 'login'

@api_view(['GET', 'POST'])
def servicio_list(request):
    """Lista todos los servicios o registra uno nuevo con sus ocho datos."""
    if request.method == 'GET':
        return Response(ServicioSerializer(Servicio.objects.all(), many=True).data)
    serializer = ServicioSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def servicio_detail(request, pk):
    """Busca por identificador, actualiza con PUT o elimina un servicio."""
    servicio = get_object_or_404(Servicio, pk=pk)
    if request.method == 'GET':
        return Response(ServicioSerializer(servicio).data)
    if request.method == 'DELETE':
        servicio.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = ServicioSerializer(servicio, data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

@api_view(['GET'])
def opciones(request):
    """Opciones de los selectores DATO 3 y DATO 6 de la pauta."""
    return Response({'especialistas': [value for value, _ in ESPECIALISTAS],
                     'direcciones': [value for value, _ in DIRECCIONES]})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def obtener_token(request):
    serializer = TokenObtainPairSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response(serializer.validated_data)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def renovar_token(request):
    serializer = TokenRefreshSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except TokenError as error:
        raise InvalidToken(str(error)) from error
    return Response(serializer.validated_data)
