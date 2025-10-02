from flask import Flask, jsonify, request


def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/health")
    def health() -> tuple:
        return jsonify({"status": "ok"}), 200

    @app.post("/echo")
    def echo() -> tuple:
        payload = request.get_json(silent=True) or {}
        return jsonify(payload), 200

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=6000)


