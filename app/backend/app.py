from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="cloudcart",
        password="CloudCart@123",
        database="cloudcart"
    )

@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to CloudCart API"
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "UP"
    })

@app.route("/products")
def products():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM products")
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
