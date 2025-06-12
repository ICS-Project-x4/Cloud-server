from app.database import SessionLocal, engine, Base
from app.models import User, Wallet
from app.auth.utils import get_password_hash

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if test user exists
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            # Create test user
            test_user = User(
                email="amine@admin.com",
                name="Test User",
                hashed_password=get_password_hash("password123")
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

            # Create wallet for test user
            wallet = Wallet(user_id=test_user.id, balance=100.00)
            db.add(wallet)
            db.commit()

            print("Test user and wallet created successfully!")
        else:
            print("Test user already exists.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 