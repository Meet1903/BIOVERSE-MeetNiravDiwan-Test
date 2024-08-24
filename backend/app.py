from flask import Flask, request, jsonify
from flask_cors import CORS
from db import db

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:helloworld@localhost/postgres'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

    with app.app_context():
        from models import Questionnaire, Question, QuestionnaireJunction, UserAnswer
        db.create_all()
    
    return app
from models import Questionnaire, Question, QuestionnaireJunction, UserAnswer, Users
app = create_app()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == 'admin':
        return jsonify({'role': 'admin'}), 200
    user = Users.query.filter_by(username=username, password=password).first()

    if user:
        return jsonify({'role': 'user', 'user_id':user.id}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
    
@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == 'admin':
        return jsonify({'message': 'Username already exists, choose a different username'}), 201
    user = Users.query.filter_by(username=username).first()

    if user:
        return jsonify({'Username already exists, choose a different username'}), 201
    else:
        new_answer = Users(
                username=username,
                password=password
            )
        db.session.add(new_answer)
    db.session.commit()
    user = Users.query.filter_by(username=username, password=password).first()
    return jsonify({'role': 'user', 'user_id':user.id}), 200

@app.route('/questionnaires', methods=['GET'])
def get_questionnaires():
    questionnaires = Questionnaire.query.all()
    print(jsonify([{"name": q.name, "id": q.id} for q in questionnaires]))
    return jsonify([{"name": q.name, "id": q.id} for q in questionnaires])

@app.route('/questionnaire/<int:questionnaire_id>/questions', methods=['GET'])
def get_questions(questionnaire_id):
    junctions = QuestionnaireJunction.query.filter_by(questionnaire_id=questionnaire_id).order_by(QuestionnaireJunction.priority).all()
    questions = []
    for j in junctions:
        question = Question.query.get(j.question_id)
        questions.append({"question": question.question, "id": question.id})
    return jsonify(questions)

@app.route('/submit_answers', methods=['POST'])
def submit_answers():
    data = request.json
    user_id = data.get('user_id')
    answers = data.get('answers')
    for answer in answers:
        existing_answer = UserAnswer.query.filter_by(
            user_id=user_id,
            question_id=answer['question_id'],
            questionnaire_id=answer['questionnaire_id']
        ).first()

        if existing_answer:
            existing_answer.answer = answer['answer']
        else:
            new_answer = UserAnswer(
                user_id=user_id,
                question_id=answer['question_id'],
                questionnaire_id=answer['questionnaire_id'],
                answer=answer['answer']
            )
            db.session.add(new_answer)
    db.session.commit()

    return jsonify({'message': 'Answers submitted successfully'}), 201

@app.route('/admin/users', methods=['GET'])
def get_users():
    users = db.session.query(
        UserAnswer.user_id, db.func.count(db.func.distinct(UserAnswer.questionnaire_id))
    ).group_by(UserAnswer.user_id).all()
    user_list = []
    for user in users:
        username = Users.query.filter_by(id=user[0]).first().username
        print(username)
        user_list.append({"user_id":user[0], "count": user[1], "username": username})
    print(users)
    return jsonify(user_list)

@app.route('/admin/user_answers/<int:user_id>', methods=['GET'])
def get_user_answers(user_id):
    answers = UserAnswer.query.filter_by(user_id=user_id).all()
    result = []
    for answer in answers:
        question = Question.query.get(answer.question_id)
        questionnaire = Questionnaire.query.get(answer.questionnaire_id)
        result.append({
            'questionnaire': questionnaire.name,
            'question': question.question['question'],
            'answer': answer.answer
        })
    return jsonify(result)

@app.route('/user_answers/<int:user_id>/<int:questionnaire_id>', methods=['GET'])
def get_user_answers_questionnaire_id(user_id, questionnaire_id):
    answers = UserAnswer.query.filter_by(user_id=user_id).all()
    result = []
    for answer in answers:
        if answer.questionnaire_id == questionnaire_id:
            result.append({"question_id":answer.question_id, "answer": answer.answer})
    return jsonify(result)

@app.route('/usernames', methods=['GET'])
def get_usernames():
    try:
        users = Users.query.all()
        usernames = [user.username for user in users]
        return jsonify(usernames)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return 'Hello world'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, ssl_context=('cert.pem', 'key.pem'))