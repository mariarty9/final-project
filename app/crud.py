# CRUD = Create, Read, Update, Delete
# This file contains all the logic for what happens with tasks

from app import utils                               # For file operations
from app.pydantic_models import TaskCreate          # For creating tasks

def get_all_tasks(completed = None):                # Get all tasks, optionally filtered by completion status
# completed(bool, optional) 
    # if True, returns only completed tasks
    # if False, returns only pending tasks
    # if None, returns all tasks
    print(f"Getting all tasks with filter: completed ={completed}")
    tasks = utils.load_tasks()                      # Loads all tasks from file using utils
    if completed is not None:                       # If it is NOT None, filter the list
        filtered_tasks = []                         # Creates a new list for filtered tasks

        for task in tasks:
            if task['completed'] == completed:      # Keeps only tasks where completed matches the filter
                filtered_tasks.append(task)
        print(f"Found {len(filtered_tasks)} tasks after filtering")
        return filtered_tasks
    print(f"Returning all {len(tasks)} tasks")
    return tasks

def get_task_by_id(task_id):                        # Get a single task by ID

    print(f"Looking for task with ID: {task_id}")
    tasks = utils.load_tasks()

    for task in tasks:
        if task['id'] == task_id:                   # Searches for the task wit matching ID
            print(f"Found task: {task}")            # If task is found
            return task
    print(f"Task with ID {task_id} not found")      # If task is NOT found
    return None  
    
def create_task(task_data):                         # Creates new task
    print(F"Creating new task with title: {task_data.title}")
    tasks = utils.load_tasks()

    new_id = utils.get_next_id()                    # Generates new ID

    new_task = {                                    # Converts the pydantic model to a dict & adds ID and completed status
        'id': new_id,                               # Auto-generated ID
        'title': task_data.title,                   # Title from request
        'description': task_data.description,       # Description from request; can also be None
        'completed': False                          # New task starts as NOT completed
    }
    tasks.append(new_task)                          # Adds task to the list
    print(f"Added new task to the list: {new_task}")

    if utils.save_tasks(tasks):                                     # Saves task to file
        print(f"Successfully saved ew task with ID {new_id}")       
        return new_task                                             
    else:                                                           # In case saving fails
        print(f"Failed to save new task")
        return None         
    
def update_task(task_id, title = None, description = None, completed = None):               # Updates existing task

    print(f"Updating task ID {task_id}")
    tasks = utils.load_tasks()

    for i, task in enumerate(tasks):                                        # Find the task to update; I need index to update the original list
        if task['id'] == task_id:                                           # Check if this is the task that is needed
            print(f"Found task to update: {task}")

            if title is not None:                                           # Update title if a new value was provided; title is not None means the user set  title parameter                    
                tasks[i]['title'] = title                                   # Updates the task at position i in the list
                print(f"Updated title to: {title}")
            

            if description is not None:                                     # Updates description; follows the same logic as title update
                tasks[i]['description'] = description
                print(f"Updated the description to: {description}")

            if completed is not None:                                       # Updates complition status; follows the same logic as title/description update
                tasks[i]['completed'] = completed
                print(f"Upadted completed to: {completed}")

            if utils.save_tasks(tasks):                                     # Saves the updated list to file
                print(f"Successfully saved updated task")
                return tasks[i]
            else:
                print(f"Failed to save updated task")                       # If saving fails
                return None
            
    print(f"Task ID {task_id} not found for update")                        # If the task's ID wasn't found
    return None


def delete_task(task_id):                                                   # Delete a task by ID
    print(f"Deleting task with ID {task_id}")
    tasks = utils.load_tasks()

    new_tasks = []                                                          # Create a new list excluding the task to delete
    found = False                                                           # Flag to track if the task was found

    for task in tasks:
        if task['id'] == task_id:
            found = True                                                    # This is the task to delete
            print(f"Found task to delete: {task}")
        else:
            new_tasks.append(task)                                          # This is NOT the task to delete, so I keep it

    if found:
        print(f"Removed task {task_id}, saving remaining {len(new_tasks)} tasks")       # If the task was found
        return utils.save_tasks(new_tasks)                                              # Saves the filtered list
    
    print(f"Task ID {task_id} not found for deletion")                                  # Task not found 
    return False

def delete_all_tasks():                             # Deletes all tasks
    print(f"Deleting ALL tasks")
    return utils.save_tasks([])                     # Saves an empty list to the file; overwrites all existing tasks with nothing

def get_statistics():                               # Get task statisctics: total number, number of completed/pending, percentage of completed tasks
    print(f"Calculationg task statistics")
    tasks = utils.load_tasks()

    total = len(tasks)                              # Total number of tasks
    print(f"Tasks in total: {total}")

    completed = 0                                   # Counts completed tasks
    for task in tasks:
        if task['completed']:
            completed += 1

    pending = total - completed                     # Calculates pending tasks

    if total > 0:                                   # Calculates completion percentage; avoids division by zero if there are no tasks
        percentage=(completed/total) * 100
    else:
        percentage = 0
    print(f"Completed: {completed}, Pending: {pending}, Completion percentage: {percentage}%")

    return {                                        # Returns statistics as dictionary
        'total_tasks': total,
        'completed_tasks': completed,
        'pending_tasks': pending,
        'completion_percentage': round(percentage, 2)
    }

