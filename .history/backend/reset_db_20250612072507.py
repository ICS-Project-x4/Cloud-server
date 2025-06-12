from app.database import recreate_tables
from app.models import Base

if __name__ == "__main__":
    print("Dropping all tables...")
    recreate_tables()
    print("Database reset complete!") 