from fastapi import FastAPI, HTTPException, Depends # Import core of framework to build API; httpexception raises api errors
from contextlib import asynccontextmanager  # Use to define async setup and teardown logic 
from database import database, engine, metadata
import models   # registers my 'tasks' table
from models import tasks
from schemas import TaskCreate, Task, TaskUpdate
from fastapi.middleware.cors import CORSMiddleware



# Lifespan event handler
# Runs when app starts and stops
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up the FastAPI server...")
    # Initialize things here (like DB connection)
    
    # create all the tables defined in the metadata object if they don't exist
    # bind=engine specifies the database connection (the engine) where the tables should be created
    metadata.create_all(bind=engine)

    # connect to the database
    await database.connect()
    
    yield

    # Disconnect from the database
    await database.disconnect()
    print("🛑 Shutting down the FastAPI server...")
    # Clean up logic here

# Initialize FastAPI app and attach custom lifespan handler
app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000", # My Next.js frontend address
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define route (endpoint) for HTTP GET requests to the root URL
# When someone accesses root of API, this function is called and returns JSON message
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Task Manager API!"}

# Defines FastAPI endpoint that handles creating a new task in a database
@app.post("/tasks/", response_model=Task)   # HTTP POST endpoint at /tasks/; response normalized using Task pydantic model
async def create_task(task: TaskCreate):
    task_data = task.model_dump()   # converts TaskCreate pydantic object into plain Python dictionary
    query = tasks.insert().values(
        title=task_data["title"],
        description=task_data.get("description"),
        due_date=task_data.get("due_date"),
        completed=False,
        user_id=1   # default value for now; change later
    )
    last_record_id = await database.execute(query)  # executes the SQL insert async and returns ID of newly created record
    
    # combines original task data with new id and completed status
    # returns dict that matches Task response model
    return {**task_data, "id": last_record_id, "completed": False}  

# GET /tasks/ endpoint
# List all tasks stored in the database
@app.get("/tasks/", response_model=list[Task])
async def read_tasks():
    query = tasks.select()
    return await database.fetch_all(query)

# GET /tasks/{task_id} endpoint
# retrieve a specific task by its ID
@app.get("/tasks/{task_id}", response_model=Task)
async def read_task(task_id: int):
    query = tasks.select().where(tasks.c.id == task_id)
    task = await database.fetch_one(query)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# PUT /tasks/{task_id} endpoint
# update an existing task
@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task_update: TaskUpdate):

    # only update fields that are set
    update_data = task_update.model_dump(exclude_unset=True)

    query = tasks.update().where(tasks.c.id == task_id).values(**update_data)
    result = await database.execute(query)

    # fetch updated task
    updated_task = await database.fetch_one(tasks.select().where(tasks.c.id == task_id))
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return updated_task



# DELETE /tasks/{task_id} endpoint
# allow deleting tasks
@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    query = tasks.delete().where(tasks.c.id == task_id)
    result = await database.execute(query)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    


