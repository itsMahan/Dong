# Dong Project Setup

## Prerequisites
Make sure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## Running the Project

All commands should be run from the **root project directory** (where `docker-compose.yml` is).

### Start all services (backend + frontend)
```bash
docker-compose up --build
```
> Use `--build` the first time, or whenever `requirements.txt` or `package.json` change. After that, just `docker-compose up` is enough.

Once running:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Admin panel: http://localhost:8000/admin

### Stop all services
```bash
docker-compose down
```

---

## Running Commands Inside the Container

To run Django management commands (migrations, createsuperuser, etc.), open a new terminal while the containers are running:

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create an admin user
docker-compose exec backend python manage.py createsuperuser

# Open a shell inside the backend container
docker-compose exec backend sh
```

---

## First Time Setup

After starting the containers for the first time, run migrations:

```bash
docker-compose exec backend python manage.py migrate
```

To create an admin user:
```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## Project Structure

```
Dong/
├── docker-compose.yml
├── SETUP.md
├── back/                  # Django backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   └── ...
└── front/
    └── Dong/              # React frontend
        ├── Dockerfile
        ├── package.json
        └── ...
```

---

## Generating Fake Data

To populate the database with realistic test data, run:

```bash
# Default: creates 3 users with 2 dongs each
docker-compose exec backend python manage.py create_fake_data

# Custom amounts
docker-compose exec backend python manage.py create_fake_data --users 5 --dongs 3
```

All generated users have the password: `pass@123`

---

## Environment Variables

The backend requires a `.env` file inside `back/`. Ask the project lead for the contents of this file.