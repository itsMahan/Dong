# Dong 💸

**Dong** ("دنگ" — Persian slang for "your share of a shared bill") is a full-stack expense-splitting app, similar in spirit to Splitwise or Tricount. It lets a group create a shared pool of expenses ("a Dong"), add members, log who paid for what, and automatically figures out who owes whom — with the minimum number of transactions needed to settle up.

Originally built as a university project, currently being extended with more features.

## Features

- **JWT authentication with email OTP verification** — register with email, verify via a one-time code, then log in with short-lived JWT access/refresh tokens.
- **Password reset flow** via email.
- **Dongs (expense groups)** — create, update, and delete shared expense groups, each with an optional total budget.
- **Members** — add/remove participants by name (no account required for members, only for the group owner).
- **Expenses** — log expenses with:
  - Quantity and per-item amount
  - Optional tax percentage
  - "Total" vs "Individual" expense types
  - Custom participant lists per expense (split only among the people who were actually involved)
- **Balance & settlement engine** — calculates each member's balance and generates a simplified list of "who pays whom how much" to settle the group with the fewest possible transfers.
- **Per-member detail view** — a breakdown of what a single member paid, owes, and is owed.
- **Budget analytics** — burn rate, daily average spend, and a forecast of when the budget will run out, based on current spending pace.
- **Auto-generated API docs** via `drf-spectacular`.
- **Fake data generator** — a management command to seed the database with realistic demo users, groups, and expenses for local development/demos.

## Tech Stack

**Backend**
- Python / Django 5.2 + Django REST Framework
- `djangorestframework-simplejwt` for JWT auth
- `drf-spectacular` for OpenAPI schema generation
- SQLite (dev)
- `Faker` for fake/demo data
- Dockerized

**Frontend**
- React 19 + Vite
- Tailwind CSS + DaisyUI
- React Router
- i18next (multi-language support)
- Axios

## Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Run it

```bash
git clone https://github.com/itsMahan/Dong.git
cd Dong
docker-compose up --build
```

Once it's up:

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Frontend | http://localhost:5173 |
| Admin panel | http://localhost:8000/admin |

### First-time setup

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Seed demo data

```bash
docker-compose exec backend python manage.py create_fake_data --users 5 --dongs 3
```

All generated demo users share the password `pass@123`.

### Environment variables

The backend expects a `.env` file inside `back/`. See `SETUP.md` for details.

## Project Structure

```
Dong/
├── docker-compose.yml
├── back/                  # Django backend
│   ├── accounts/          # Auth, OTP verification, JWT
│   └── dongs/              # Groups, members, expenses, balance/settlement logic
└── front/
    └── Dong/               # React + Vite frontend
```

## Screenshots

<!--
Add a few screenshots here so recruiters/visitors get a quick feel for the app, e.g.:

![Home page](docs/screenshots/home.png)
![Balance & settlement view](docs/screenshots/balance.png)

Put the images in a `docs/screenshots/` folder in the repo and update the paths above.
-->
![](docs/screenshots/1.png)
![](docs/screenshots/2.png)

## Roadmap

- [ ] Recurring expenses
- [ ] Push/email notifications when settlements are due
- [ ] Multi-currency support
- [ ] CI pipeline (GitHub Actions workflow already scaffolded)

## License

Add a license of your choice (MIT is a common default for personal projects)
