from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase
from .models import Servicio, ESPECIALISTAS, DIRECCIONES

class ServicioAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = get_user_model().objects.create_user('prueba', password='SoloPruebas-987654!')
        self.datos = {
            'id_servicio': 104, 'servicio': 'Reparación de filtraciones',
            'especialista': ESPECIALISTAS[0][0], 'reputacion': '4.8',
            'correo_contacto': 'prueba@example.com', 'direccion': DIRECCIONES[0][0],
            'hora_atencion': '09:30:00', 'telefono_contacto': '+56912345678',
        }

    def autenticar(self):
        response = self.client.post('/api/token/', {'username': 'prueba', 'password': 'SoloPruebas-987654!'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response.data

    def test_listado_y_busqueda_con_ocho_campos(self):
        self.autenticar()
        Servicio.objects.create(**self.datos)
        listado = self.client.get('/gasfiteria/')
        self.assertEqual(listado.status_code, 200)
        self.assertEqual(len(listado.data), 1)
        self.assertEqual(set(listado.data[0]), set(self.datos))
        detalle = self.client.get('/gasfiteria/104/')
        self.assertEqual(detalle.data, listado.data[0])
        self.assertEqual(self.client.get('/gasfiteria/999/').status_code, 404)

    def test_post_persiste_y_devuelve_201(self):
        self.autenticar()
        respuesta = self.client.post('/gasfiteria/', self.datos, format='json')
        self.assertEqual(respuesta.status_code, 201, respuesta.data)
        self.assertEqual(Servicio.objects.get(pk=104).servicio, self.datos['servicio'])

    def test_id_duplicado_no_sobrescribe(self):
        self.autenticar()
        Servicio.objects.create(**self.datos)
        response = self.client.post('/gasfiteria/', self.datos, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('id_servicio', response.data)
        self.assertEqual(Servicio.objects.count(), 1)

    def test_put_actualiza_todos_los_datos(self):
        self.autenticar()
        Servicio.objects.create(**self.datos)
        nuevos = {**self.datos, 'servicio': 'Instalación sanitaria', 'especialista': ESPECIALISTAS[1][0],
                  'reputacion': '3.5', 'correo_contacto': 'nuevo@example.com',
                  'direccion': DIRECCIONES[1][0], 'hora_atencion': '14:00:00',
                  'telefono_contacto': '+56987654321'}
        response = self.client.put('/gasfiteria/104/', nuevos, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(self.client.get('/gasfiteria/104/').data, nuevos)

    def test_no_se_permite_cambiar_identificador(self):
        self.autenticar()
        Servicio.objects.create(**self.datos)
        response = self.client.put('/gasfiteria/104/', {**self.datos, 'id_servicio': 105}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Servicio.objects.filter(pk=104).exists())
        self.assertFalse(Servicio.objects.filter(pk=105).exists())

    def test_delete_elimina_y_devuelve_204(self):
        self.autenticar()
        Servicio.objects.create(**self.datos)
        self.assertEqual(self.client.delete('/gasfiteria/104/').status_code, 204)
        self.assertFalse(Servicio.objects.filter(pk=104).exists())
        self.assertEqual(self.client.delete('/gasfiteria/104/').status_code, 404)

    def test_escrituras_sin_autenticar_rechazadas(self):
        Servicio.objects.create(**self.datos)
        self.assertEqual(self.client.post('/gasfiteria/', self.datos, format='json').status_code, 401)
        self.assertEqual(self.client.put('/gasfiteria/104/', self.datos, format='json').status_code, 401)
        self.assertEqual(self.client.delete('/gasfiteria/104/').status_code, 401)
        self.assertEqual(Servicio.objects.count(), 1)

    def test_lecturas_sin_autenticar_no_exponen_datos(self):
        Servicio.objects.create(**self.datos)
        for ruta in ['/gasfiteria/', '/gasfiteria/104/', '/gasfiteria/opciones/']:
            with self.subTest(ruta=ruta):
                respuesta = self.client.get(ruta)
                self.assertEqual(respuesta.status_code, 401)
                self.assertNotIn('Reparación de filtraciones', str(respuesta.data))

    def test_todos_los_campos_son_obligatorios_no_vacios_ni_nulos(self):
        self.autenticar()
        for field in self.datos:
            for mode in ['omitido', '', None]:
                with self.subTest(field=field, mode=mode):
                    datos = {**self.datos}
                    if mode == 'omitido':
                        datos.pop(field)
                    else:
                        datos[field] = mode
                    response = self.client.post('/gasfiteria/', datos, format='json')
                    self.assertEqual(response.status_code, 400, response.data)
                    self.assertIn(field, response.data)

    def test_validacion_limites_y_formatos(self):
        self.autenticar()
        invalidos = [('id_servicio', 0), ('id_servicio', 1000000), ('id_servicio', 1.5),
                     ('servicio', '   '), ('servicio', 'a' * 101), ('reputacion', '-0.1'),
                     ('reputacion', '5.1'), ('reputacion', '4.55'), ('correo_contacto', 'sin-arroba'),
                     ('telefono_contacto', '1' * 17), ('hora_atencion', '25:00'),
                     ('especialista', 'No existe'), ('direccion', 'No existe')]
        for campo, valor in invalidos:
            with self.subTest(campo=campo, valor=valor):
                response = self.client.post('/gasfiteria/', {**self.datos, campo: valor}, format='json')
                self.assertEqual(response.status_code, 400, response.data)

    def test_put_no_admite_datos_incompletos_ni_patch(self):
        self.autenticar()
        Servicio.objects.create(**self.datos)
        self.assertEqual(self.client.put('/gasfiteria/104/', {'servicio': 'Nuevo'}, format='json').status_code, 400)
        self.assertEqual(self.client.patch('/gasfiteria/104/', {}, format='json').status_code, 405)

    def test_jwt_renovacion_y_token_invalido(self):
        tokens = self.autenticar()
        response = self.client.post('/api/token/refresh/', {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        response = self.client.post('/api/token/refresh/', {'refresh': 'invalido'}, format='json')
        self.assertIn(response.status_code, [401, 403])
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalido')
        self.assertEqual(self.client.post('/gasfiteria/', self.datos, format='json').status_code, 401)

    def test_credenciales_incorrectas_y_limite_intentos(self):
        for _ in range(10):
            response = self.client.post('/api/token/', {'username': 'prueba', 'password': 'incorrecta'}, format='json')
            self.assertIn(response.status_code, [401, 403])
        self.assertEqual(self.client.post('/api/token/', {}, format='json').status_code, 429)

    def test_api_navegable_con_formulario_put_y_sesion(self):
        Servicio.objects.create(**self.datos)
        self.client.login(username='prueba', password='SoloPruebas-987654!')
        response = self.client.get('/gasfiteria/104/', HTTP_ACCEPT='text/html')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'PUT')
        self.assertContains(response, 'DELETE')
        self.assertContains(response, 'Reparación de filtraciones')

    def test_cors_solo_origenes_locales_configurados(self):
        response = self.client.options('/gasfiteria/', HTTP_ORIGIN='http://127.0.0.1:5173', HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')
        self.assertEqual(response['Access-Control-Allow-Origin'], 'http://127.0.0.1:5173')
        response = self.client.options('/gasfiteria/', HTTP_ORIGIN='https://otro.example', HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')
        self.assertNotIn('Access-Control-Allow-Origin', response)

    def test_opciones_corresponden_al_modelo(self):
        self.autenticar()
        response = self.client.get('/gasfiteria/opciones/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['especialistas'], [value for value, _ in ESPECIALISTAS])
        self.assertEqual(response.data['direcciones'], [value for value, _ in DIRECCIONES])
