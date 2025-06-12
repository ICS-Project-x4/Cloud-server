from app.database import SessionLocal, engine, Base
from app.models import User, Wallet, Sim, SimStatus
from app.auth.utils import get_password_hash
from datetime import datetime, timedelta

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if test user exists
        test_user = db.query(User).filter(User.email == "amine@admin.com").first()
        if not test_user:
            # Create test user
            test_user = User(
                email="amine@admin.com",
                username="amine",
                hashed_password=get_password_hash("amine")
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

            # Create wallet for test user with initial balance
            wallet = Wallet(user_id=test_user.id, balance=1000.00)  # Starting with 1000.00
            db.add(wallet)
            db.commit()

            # Create a SIM for the test user
            sim = Sim(
                user_id=test_user.id,
                iccid="89012345678901234567",
                phone_number="+33612345678",
                status=SimStatus.ACTIVE,
                is_active=True,
                messages_limit=1000,
                messages_used=0,
                expiry_date=datetime.utcnow() + timedelta(days=365)  # Valid for 1 year
            )
            db.add(sim)
            db.commit()

            print("Test user, wallet, and SIM created successfully!")
            print(f"User ID: {test_user.id}")
            print(f"Wallet Balance: {wallet.balance}")
            print(f"SIM ID: {sim.id}")
            print(f"SIM Phone Number: {sim.phone_number}")
        else:
            print("Test user already exists.")
            # Update wallet balance if needed
            wallet = db.query(Wallet).filter(Wallet.user_id == test_user.id).first()
            if wallet:
                wallet.balance = 1000.00
                db.commit()
                print(f"Updated wallet balance to: {wallet.balance}")
            
            # Check if SIM exists
            sim = db.query(Sim).filter(Sim.user_id == test_user.id).first()
            if not sim:
                # Create a SIM for the existing user
                sim = Sim(
                    user_id=test_user.id,
                    iccid="89012345678901234567",
                    phone_number="+33612345678",
                    status=SimStatus.ACTIVE,
                    is_active=True,
                    messages_limit=1000,
                    messages_used=0,
                    expiry_date=datetime.utcnow() + timedelta(days=365)
                )
                db.add(sim)
                db.commit()
                print(f"Created new SIM with ID: {sim.id}")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 