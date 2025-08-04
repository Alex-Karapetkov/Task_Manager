# use pydantic (powerful Python library for data validation and serialization) to validate incoming data (from client or API),
# serialize outgoing data (to JSON) and ensure data is structured and correct
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# For creating a new task (client input)
# used when client sends data to create a new task
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

# For reading tasks (API response)
# used when sending data back to the client (in an API response)
class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool

    # tells pydantic to accept ORM objects (like SQLAlchemy models) and convert them to pydantic models
    class Config:
        orm_mode = True