from flask import Flask, jsonify
import mysql.connector
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
from flask import Response

app = Flask(__name__)
REQUEST_COUNT = Counter(
    'cloudcart_requests_total',
    'Total HTTP Requests'
)

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="cloudcart",
        password="CloudCart@123",
        database="cloudcart"
    )

@app.route("/")
def home():
    REQUEST_COUNT.inc()
    return jsonify({
        "message": "Welcome to CloudCart API - Version 3",
        "deployed_by":"Jenkins Kubernetes Pipeline"
    })

@app.route("/health")
def health():
    REQUEST_COUNT.inc()
    return jsonify({
        "status": "UP"
    })

@app.route("/products")
def products():
    REQUEST_COUNT.inc()
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM products")
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(result)

@app.route("/metrics")
def metrics():
    return Response(
        generate_latest(),
        mimetype=CONTENT_TYPE_LATEST
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
