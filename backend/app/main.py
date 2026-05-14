from routes.journal import app
from db.database import init_db

if __name__ == "__main__":
    # Initialize the database
    init_db()

    # Start the Flask server
    app.run(debug=True, host="0.0.0.0", port=5549)
