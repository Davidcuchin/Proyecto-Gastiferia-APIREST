# Evaluación 3 — David Gonzalez

Proyecto Django REST + React-Vite + MySQL.

## Datos de acceso

| Dato | Valor |
|---|---|
| MySQL host | `127.0.0.1` |
| MySQL port | `3307` |
| Base de datos | `eva3_back_end` |
| Usuario MySQL | `eva3_user` |
| Contraseña MySQL | `123456` |
| Usuario root MySQL | `root` |
| Contraseña root | `123456` |
| Usuario aplicación/API | `administrador` |
| Contraseña aplicación/API | `123456` |

## Instalación inicial

Abre Docker Desktop y, desde esta carpeta:

```bash
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-lock.txt
docker compose up -d --wait
cd eva3_api_na
python manage.py migrate
python manage.py createsuperuser --noinput
cd ../eva3_react_na
npm ci
```

`createsuperuser --noinput` toma las variables `DJANGO_SUPERUSER_*` desde `.env`.

## Abrir el proyecto

Terminal 1, backend:

```bash
cd "/Users/davidcuchin/Documents/PRUEBA FINAL"
source .venv/bin/activate
docker compose up -d --wait
cd eva3_api_na
python manage.py runserver
```

Terminal 2, frontend:

```bash
cd "/Users/davidcuchin/Documents/PRUEBA FINAL/eva3_react_na"
npm run dev
```

Abrir:

- Aplicación: http://127.0.0.1:5173/
- API: http://127.0.0.1:8000/gasfiteria/
- Login de la API: http://127.0.0.1:8000/api-auth/login/

## Cerrar el proyecto

Presiona `Control + C` en cada terminal. Después, desde la raíz:

```bash
docker compose stop
```

Esto detiene MySQL y conserva los datos.

## Datos de demostración opcionales

```bash
cd eva3_api_na
python manage.py datos_demo
```
