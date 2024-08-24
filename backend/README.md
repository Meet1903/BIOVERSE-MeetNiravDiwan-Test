## Steps to run the backend

1. Make sure you have Python, Flask, and other dependencies are installed.
2. Install PostgreSQL.
3. Create tables and populate values. We have questionnaire_questionnaire, questionnaire_questions, questionnaire_junction, users, user_answer tables. 
4. Generate certificate & key using below code:
```
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```
5. To make sure all tables are ready for use. Run below command before running the script.
```
flask shell
>>> from app import db
>>> db.create_all()
```
6. Run the application:
```
python3 app.py
```