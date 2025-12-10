## Backend Setup
cd back

# create a virtual environment - Only Once
#macOS / Linux
python3 -m venv venv

# Windows
py -m venv venv

# activate virtual environment
source venv/bin/activate

# Windows (cmd)
venv\Scripts\activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Note: To exit the virtual environment at any time, just type deactivate

# install dependencies
pip install -r requirements.txt

# cd into where manage.py file exists
cd Dong 

# run migrations
python manage.py migrate
# run development server
python manage.py runserver


# how to create an admin user
# in the same folder as manage.py
python manage.py createsuperuser
# go to http://127.0.0.1:8000/admin/