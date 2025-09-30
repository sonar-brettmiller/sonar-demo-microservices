import app
import json


def test_health_endpoint_returns_ok():
    client = app.create_app().test_client()
    response = client.get("/health")
    assert response.status_code == 200
    body = response.get_json()
    assert body == {"status": "ok"}


def test_health_endpoint_returns_json():
    client = app.create_app().test_client()
    response = client.get("/health")
    assert response.content_type == "application/json"


def test_echo_endpoint_round_trips_payload():
    client = app.create_app().test_client()
    payload = {"hello": "world", "answer": 42}
    response = client.post("/echo", json=payload)
    assert response.status_code == 200
    assert response.get_json() == payload


def test_echo_endpoint_handles_empty_payload():
    client = app.create_app().test_client()
    response = client.post("/echo", json={})
    assert response.status_code == 200
    assert response.get_json() == {}


def test_echo_endpoint_handles_null_payload():
    client = app.create_app().test_client()
    response = client.post("/echo")
    assert response.status_code == 200
    assert response.get_json() == {}


def test_echo_endpoint_handles_string_values():
    client = app.create_app().test_client()
    payload = {"message": "test string"}
    response = client.post("/echo", json=payload)
    assert response.status_code == 200
    assert response.get_json() == payload


def test_echo_endpoint_handles_nested_objects():
    client = app.create_app().test_client()
    payload = {
        "user": {
            "name": "test",
            "settings": {
                "theme": "dark"
            }
        }
    }
    response = client.post("/echo", json=payload)
    assert response.status_code == 200
    assert response.get_json() == payload


def test_echo_endpoint_handles_arrays():
    client = app.create_app().test_client()
    payload = {"items": [1, 2, 3, 4, 5]}
    response = client.post("/echo", json=payload)
    assert response.status_code == 200
    assert response.get_json() == payload


def test_health_endpoint_method_not_allowed():
    client = app.create_app().test_client()
    response = client.post("/health")
    assert response.status_code == 405


def test_echo_endpoint_get_not_allowed():
    client = app.create_app().test_client()
    response = client.get("/echo")
    assert response.status_code == 405


def test_nonexistent_route_returns_404():
    client = app.create_app().test_client()
    response = client.get("/nonexistent")
    assert response.status_code == 404


def test_create_app_returns_flask_instance():
    application = app.create_app()
    assert application is not None
    assert hasattr(application, 'test_client')