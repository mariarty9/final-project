# This file will handle al interactions with the file system
# Uses JSON Lines format

import json
import os

DATA_FILE = "tasks.txt"                         # DEfine the path to data file

def load_tasks():                               # Loads tasks from file
    if not os.path.exists(DATA_FILE):           # Checks if the file exists; if not, returns empty list
        print(f"File {DATA_FILE} doesn't exist yet.")
        return []                               
    
    tasks = []                                  # Initializes empty list to store tasks

    try:
        with open(DATA_FILE, 'r') as f:
            for line in f:
                line = line.strip()             # Removes whitespace from the line
                if line:                        # Only process non-empty lines
                    task = json.loads(line)     # Converts JSON string to Python dictionary
                    tasks.append(task)          # And adds it to the list
        print(f"Successfully loaded {len(tasks)} tasks from {DATA_FILE}")   
        return tasks                            # Returns the list of tasks
    except Exception as e:                      # If anything goes wrong, prints error and return empty list
        print(f"Error loading tasks: {e}")
        return []


def save_tasks(tasks):                          # Saves tasks to file
    try:
        with open(DATA_FILE, 'w') as f:
            for task in tasks:
                f.write(json.dumps(task) + '\n')    # Converts task dict to JSON string and write it and adds newline
        print(f"Successfully saved {len(tasks)} tasks to {DATA_FILE}")
        return True
    except Exception as e:
        print(f"Error saving tasks: {e}")           # Once again, if anything goes wrong = error
        return False                                


def get_next_id():                                  # Generates next available ID
    tasks = load_tasks()                            # Loads all existing tasks
    if not tasks:                                   # If there are no tasks, start with ID 1
        print("No existing tasks. Starting with ID 1")
        return 1
    max_id = 0                                      # Need to find themaximum ID in the list, so I initialize max_id to 0, since ID should start with 1
    for task in tasks:                              # Loops throught each task to find the largest ID
        if task['id'] > max_id:
            max_id = task['id']
    next_id = max_id + 1
    print(f"Current max ID is {max_id}, next ID will be {next_id}")
    return next_id                                  # Returns next available ID      

