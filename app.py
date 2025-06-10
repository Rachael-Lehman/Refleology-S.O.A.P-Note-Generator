from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///responses.db"
app.config["SECRET_KEY"] = "your_secret_key"
db = SQLAlchemy(app)


# Define a model for storing responses
class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    feedback = db.Column(db.Text, nullable=False)


# Home route to show form
@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

# ✅ Add your API route here
@app.route("/api/user", methods=["GET", "POST"])
def get_user():
    return jsonify({
        "displayName": "Test User",
        "email": "test@example.com"
    })

#@app.route("/api/list-notes", methods=["GET, "POST"])
#def get_notes():
#    return jsonify({
#        "name": "Test patient",
#        "note": "test fiest flient note"
#    })

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=3000)
