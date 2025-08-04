from sqlalchemy import Table, Column, Integer, String, Boolean, DateTime
from database import metadata   # import metadata object already created to register table def so it can be created in db

# Define SQLAlchemy table schema for a tasks table in db
# Part of structure of db that allows to store and retrieve task related data

tasks = Table(
    "tasks",
    metadata,   # metadata object registers the table
    Column("id", Integer, primary_key=True),
    Column("title", String, nullable=False),    # required
    Column("description", String, nullable=True),   # optional
    Column("due_date", DateTime, nullable=True),    # optional
    Column("completed", Boolean, default=False),    # default is false
)