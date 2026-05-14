"""
Grant admin privileges to a user by email.
Usage: cd backend && uv run python scripts/make_admin.py <email>
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, UserModel


def main():
    if len(sys.argv) != 2:
        print("Usage: uv run python scripts/make_admin.py <email>")
        sys.exit(1)

    email = sys.argv[1]
    db = SessionLocal()

    try:
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            print(f"User with email '{email}' not found.")
            sys.exit(1)

        user.is_admin = True
        db.commit()
        print(f"User '{email}' is now an admin.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
