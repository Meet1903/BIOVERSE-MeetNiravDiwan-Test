from db import db

class Questionnaire(db.Model):
    __tablename__ = 'questionnaire_questionnaires'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)

class Question(db.Model):
    __tablename__ = 'questionnaire_questions'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.JSON, nullable=False)

class QuestionnaireJunction(db.Model):
    __tablename__ = 'questionnaire_junction'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questionnaire_questions.id'))
    questionnaire_id = db.Column(db.Integer, db.ForeignKey('questionnaire_questionnaires.id'))
    priority = db.Column(db.Integer, nullable=False)

class UserAnswer(db.Model):
    __tablename__ = 'user_answers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questionnaire_questions.id'))
    questionnaire_id = db.Column(db.Integer, db.ForeignKey('questionnaire_questionnaires.id'))
    answer = db.Column(db.JSON, nullable=False)

class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)