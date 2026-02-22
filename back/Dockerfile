# 1. Use a lightweight Python image
FROM python:3.10-slim

# 2. Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set the directory where our code will live inside the container
WORKDIR /app

# 4. Install dependencies
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

# 5. Copy the rest of your project code
COPY . .

# 6. Run the server on 0.0.0.0 (important for Docker)
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]