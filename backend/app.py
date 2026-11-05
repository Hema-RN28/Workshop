import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from postgrest import APIError
from supabase import Client, create_client

load_dotenv(Path(__file__).with_name(".env"))

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")

app = Flask(__name__)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def api_error(error, default_status=500):
    """Return a consistent JSON response for a PostgREST error."""
    status = getattr(error, "code", None)
    try:
        status = int(status)
    except (TypeError, ValueError):
        status = default_status
    if not 400 <= status <= 599:
        status = default_status
    return jsonify({"error": getattr(error, "message", str(error))}), status


def authenticated_request():
    """Return (user, request-scoped Supabase client, error response)."""
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None, None, (jsonify({"error": "Authentication required."}), 401)

    token = token.strip()
    try:
        auth_response = supabase.auth.get_user(token)
        user = auth_response.user
        if user is None:
            return None, None, (jsonify({"error": "Invalid or expired access token."}), 401)

        # Use a separate client for each authenticated request so the user's
        # JWT is forwarded to PostgREST and Supabase row-level security applies.
        user_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        user_client.postgrest.auth(token)
        return user, user_client, None
    except Exception:
        return None, None, (jsonify({"error": "Invalid or expired access token."}), 401)


@app.route("/")
def index():
    try:
        response = supabase.table("users").select("*").execute()
    except APIError as error:
        return f"<p>Error loading users: {error.message}</p>", 500

    users = response.data
    html = "<h1>Users</h1><ul>"
    for user in users:
        html += f'<li>{user["email"]}</li>'
    html += "</ul>"
    return html


@app.get("/api/events")
def list_events():
    """Browse available events."""
    try:
        result = supabase.table("events").select("*").execute()
        return jsonify(result.data), 200
    except APIError as error:
        return api_error(error)


@app.get("/api/events/<event_id>")
def get_event(event_id):
    """Return one event, or 404 when it does not exist."""
    try:
        result = (
            supabase.table("events")
            .select("*")
            .eq("id", event_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            return jsonify({"error": "Event not found."}), 404
        return jsonify(result.data[0]), 200
    except APIError as error:
        return api_error(error)


@app.post("/api/registrations")
def create_registration():
    """Register the authenticated user for an event."""
    user, db, auth_error = authenticated_request()
    if auth_error:
        return auth_error

    body = request.get_json(silent=True) or {}
    event_id = body.get("event_id")
    if event_id is None or str(event_id).strip() == "":
        return jsonify({"error": "event_id is required."}), 400

    try:
        event = (
            db.table("events")
            .select("id")
            .eq("id", event_id)
            .limit(1)
            .execute()
        )
        if not event.data:
            return jsonify({"error": "Event not found."}), 404

        existing = (
            db.table("registrations")
            .select("*")
            .eq("event_id", event_id)
            .eq("user_id", user.id)
            .limit(1)
            .execute()
        )
        if existing.data:
            return jsonify({"error": "You are already registered for this event."}), 409

        result = (
            db.table("registrations")
            .insert({"event_id": event_id, "user_id": user.id})
            .execute()
        )
        registration = result.data[0] if result.data else {
            "event_id": event_id,
            "user_id": user.id,
        }
        return jsonify(registration), 201
    except APIError as error:
        # A unique constraint also protects against simultaneous duplicate posts.
        if getattr(error, "code", None) == "23505":
            return jsonify({"error": "You are already registered for this event."}), 409
        return api_error(error)


@app.get("/api/me/registrations")
def my_registrations():
    """List the authenticated user's registrations."""
    user, db, auth_error = authenticated_request()
    if auth_error:
        return auth_error

    try:
        result = (
            db.table("registrations")
            .select("*")
            .eq("user_id", user.id)
            .execute()
        )
        return jsonify(result.data), 200
    except APIError as error:
        return api_error(error)


@app.get("/api/events/<event_id>/registrations")
def event_registrations(event_id):
    """List attendees only when the authenticated user owns the event."""
    user, db, auth_error = authenticated_request()
    if auth_error:
        return auth_error

    try:
        event_result = (
            db.table("events")
            .select("*")
            .eq("id", event_id)
            .limit(1)
            .execute()
        )
        if not event_result.data:
            return jsonify({"error": "Event not found."}), 404

        event = event_result.data[0]
        # Support the common owner column names used by event schemas.
        owner_id = next(
            (event[field] for field in ("organizer_id", "user_id", "created_by") if event.get(field) is not None),
            None,
        )
        if owner_id is None or str(owner_id) != str(user.id):
            return jsonify({"error": "Only the event organizer can view registrations."}), 403

        result = (
            db.table("registrations")
            .select("*")
            .eq("event_id", event_id)
            .execute()
        )
        return jsonify(result.data), 200
    except APIError as error:
        return api_error(error)


if __name__ == "__main__":
    app.run(debug=True)
