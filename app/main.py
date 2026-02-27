# Handles HTTP requests and responses
# Contains all API endpoints with proper error handling

from fastapi import FastAPI, HTTPException, Query
from app import crud
from app.pydantic_models import Task, TaskCreate
from fastapi.staticfiles import StaticFiles                         # Import for the frontend


app = FastAPI(
    title = "Final Project Building FastAPI",                       # Title that is ahown in Swagger UI
    dscription = "Task Management System",
    version = "1.0.0"                      
)

app.mount("/static", StaticFiles(directory = "static", html=True), name ="static")          # Makes all files in the 'static' folder available at the /static path

@app.get("/")
def root():
    return {
        "message": "Go to /static to see the frontend", "docs": "/docs",
    }

@app.get("/health")
def health_check():                                                 # If zhe serevr is running, returns the following:
    return {"status": "healthy"}                                    


@app.get("/tasks", response_model=list[Task])                       # Gets all tasks, optionally filtered by completion status
def get_tasks(completed: bool | None =Query(None)):                 # Query Parameters: completed = true (get completed tasks), complete = false (get pending tasks), completed = None (get all tasks)
    tasks = crud.get_all_tasks(completed)                           # Calls crud.py function to get tasks, handles the filtering logic
    return tasks


@app.get("/tasks/stats")
def get_statistics():                                               # Gets tasks statistics: total number of tasks, number of completed/pending tasks and completion percentage
    return crud.get_statistics()                                    # Calls the function from crud.py and handles calculation


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):                                         # Gets a specific task by ID
    task = crud.get_task_by_id(task_id)
    if not task:                                                    # Error handling if the task was not found
        raise HTTPException(status_code=404, detail= f"Task with id {task_id} not found")
    
    return task                                                     # If task was found, return it


@app.post("/tasks", response_model=Task, status_code=201)           
def create_task(task: TaskCreate):                                                          # Creates new task
    new_task = crud.create_task(task)                                                       # Calls the fucntion from crud.py; task is automatically validated by Pydantic based on TaskCreate model
    if not new_task:                                                                        # Checks if creation failed
        raise HTTPException(status_code=500, detail="Failed to create task. Server error")
    return new_task                                                                         # If the creation was successful, return new task


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, title: str | None = None, description: str | None = None, completed: bool |None =None):       # Updates an existing task
    updated_task = crud.update_task(task_id, title, description, completed)                                                 # Calls function from crud.py

    if updated_task is None:                                                                    # Checks if upfdate failed; now need to determine why
        task_exists = crud.get_task_by_id(task_id)
        if task_exists:                                                                         # If task exists but save failed, means it is a server error   
            raise HTTPException(status_code=500, detail="Failed to update task. Server error")
        else:                                                                                   # Task doesn't exist
            raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")
    
    return updated_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):                                                                  # Deletes specific task
    deleted = crud.delete_task(task_id)

    if not deleted:                                                                             # Checks if deletion failed                                                             
        task_exists = crud.get_task_by_id(task_id)                                              
        if task_exists:                                                                         # Checks if task exists 
            raise HTTPException(status_code=500, detail="Failed to delete task. Server error")  # Task exists but the process failed
        else:
            raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")    # If task doesn't exist
    return {"message": f"Task {task_id} deleted successfully"}

@app.delete("/tasks")
def delete_all_tasks():                                                                         # Deletes EVERYTHING
    if crud.delete_all_tasks():
        return {"message": "All tasks deleted successfully"}                                    # Success
    
    raise HTTPException(status_code=500, detail="Failed to delete all tasks. Server error")     # Save failed


