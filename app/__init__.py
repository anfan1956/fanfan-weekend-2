from flask import Flask

app = Flask(__name__)

from app import views, functions, data

app.config['SECRET_KEY'] = '192b9bdd22ab9ed4d12e236c78afcb9a393ec15ff5dc987d54727823bcbf'
