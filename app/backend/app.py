import os

from flask import Flask, jsonify, Response
import mysql.connector
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST


app = Flask(__name__)

REQUEST_COUNT = Counter(
    "cloudcart_requests_total",
    "Total HTTP Requests"
)


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "host.minikube.internal"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "cloudcart")
    )


@app.route("/")
def home():
    REQUEST_COUNT.inc()

    return jsonify({
        "message": "Welcome to CloudCart API - Version 3",
        "deployed_by": "Jenkins Kubernetes Pipeline"
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

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM products")
        result = cursor.fetchall()

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": "Database connection failed",
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


@app.route("/metrics")
def metrics():
    return Response(
        generate_latest(),
        mimetype=CONTENT_TYPE_LATEST
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )
