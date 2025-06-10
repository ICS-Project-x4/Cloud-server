from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Mock database
users = []

class User(BaseModel):
    name: str
    email: str
    password: str

@app.post("/register")
async def register(user: User):
    if any(u.email == user.email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    users.append(user)
    return {"message": "User registered successfully"} 