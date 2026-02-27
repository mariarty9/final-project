# Defining Pydantic Models

from pydantic import BaseModel

class Task(BaseModel):                          # Complete tasks model
    id: int                                     # Auto-generated ID
    title: str                                  # Task title
    description: str | None = None              # Optional field, defaults to None, because of |
    completed: bool = False                     

class TaskCreate(BaseModel):                    # Creating new tasks model
    title: str                                  
    description: str | None = None              