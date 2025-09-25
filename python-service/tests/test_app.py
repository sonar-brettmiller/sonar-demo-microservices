import app


def test_health_endpoint_returns_ok():
    client = app.create_app().test_client()
    response = client.get("/health")
    assert response.status_code == 200
    body = response.get_json()
    assert body == {"status": "ok"}


def test_echo_endpoint_round_trips_payload():
    client = app.create_app().test_client()
    payload = {"hello": "world", "answer": 42}
    response = client.post("/echo", json=payload)
    assert response.status_code == 200
    assert response.get_json() == payload


