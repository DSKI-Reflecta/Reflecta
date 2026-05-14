from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import datetime
from datetime import datetime as dt
from werkzeug.exceptions import BadRequest
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import DB functions
from db.database import init_db
from db.crud import (
    create_entry,
    get_entry,
    get_all_entries,
    update_entry,
    delete_entry,
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Custom JSON encoder that handles datetime objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super().default(obj)


app.json_encoder = CustomJSONEncoder


@app.route("/api/entries", methods=["GET"])
def get_entries():
    """Get all journal entries."""
    entries = get_all_entries()
    return jsonify(entries)


@app.route("/api/entries/<int:entry_id>", methods=["GET"])
def get_single_entry(entry_id):
    """Get a specific journal entry by ID."""
    entry = get_entry(entry_id)
    if entry:
        return jsonify(entry)
    return jsonify({"error": "Entry not found"}), 404


@app.route("/api/entries", methods=["POST"])
def add_entry():
    """Create a new journal entry."""
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Validate required fields
    if "title" not in data or "content" not in data:
        return jsonify({"error": "Title and content are required"}), 400

    try:
        entry_id = create_entry(
            title=data["title"], content=data["content"], mood=data.get("mood")
        )

        # Return the created entry
        new_entry = get_entry(entry_id)
        return jsonify(new_entry), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/entries/<int:entry_id>", methods=["PUT"])
def update_single_entry(entry_id):
    """Update an existing journal entry."""
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        success = update_entry(
            entry_id=entry_id,
            title=data.get("title"),
            content=data.get("content"),
            mood=data.get("mood"),
        )

        if success:
            updated_entry = get_entry(entry_id)
            return jsonify(updated_entry)

        return jsonify({"error": "Entry not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/entries/<int:entry_id>", methods=["DELETE"])
def delete_single_entry(entry_id):
    """Delete a journal entry."""
    success = delete_entry(entry_id)

    if success:
        return jsonify({"message": "Entry deleted successfully"}), 200

    return jsonify({"error": "Entry not found"}), 404


@app.errorhandler(BadRequest)
def handle_bad_request(e):
    """Handle bad request errors."""
    return jsonify({"error": str(e)}), 400


@app.errorhandler(Exception)
def handle_general_exception(e):
    """Handle general exceptions."""
    return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Initialize the database before starting the app
    init_db()
    app.run(debug=True, port=5000)
