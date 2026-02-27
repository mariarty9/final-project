# final-project
FINAL PROJECT: BUILDING FASTAPI TASK MANAGEMENT SYSTEM

Access the website through this link, with frontend for convenient usage: http://127.0.0.1:8000/static

# PROJECT STRUCTURE

final-project/
├── app/
│ ├── init.py
│ ├── main.py                       (API endpoints with error handling)
│ ├── pydantic_models.py            (Pydantic models)
│ ├── crud.py                       (Business logic)
│ └── utils.py                      (File operations)
├── static/                         (Frontend files)
│   ├── index.html                  (Main HTML page)
│   ├── style.css                   (Complete styling light/dark mode)
│   └── script.js                   (Frontend logic)
├── tasks.txt                       (Tasks storage) 
└── README.md 

The tasks.txt file uses JSON Lines format, e.g.:
{"id": 1, "title"; "Buy groceries", "description": "Milk, Bread", "completed": true}


# API ENDPOUINTS

- GET       /                           Health check
- GET       /health                     HEalth check
- GET       /tasks                      Get all tasks
- GET       /tasks?completed=true       Filter by status
- GET       /tasks/stats                Get statistics  (total number, completed/pending, completion percentage)
- GET       /tasks/{id}                 Get specific task
- POST      /tasks                      Create ew task
- PUT       /tasks/{id}                 Update task
- DELETE    /tasks/{id}                 Delete a specific task
- DELETE    /tasks                      Delete EVERYTHING    


# FRONTEND FEATURES

- Statistics Dashboard:
    Total tasks; 
    Completed/pending tasks; 
    Completion percentage

- Task MAnagement:
    Add task;
    Display of each task with title, description and id;
    Status indicator (visual distinction for completed tasks)
    Three action buttons (complete/undo; edit; delete)

- Filter system:
    All tasks, pending and completed

- Dark Mode:
    Toggle switch in top-right corner
    Saves preference in browser localSotrage


# Step-by-Step Setup

cd final-project

python -m venv venv

venv\Scripts\activate           # On windows
source venv/bin/activate        # On Mac/Linux

pip install fastapi uvicorn

uvicorn app.main:app --reload