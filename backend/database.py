# Sets up database connection and configuration for a FastAPI application using:
# - databases for async database access
# - SQLAlchemy for defining and interacting with the database schema
# - SQLite as the actual database engine

from databases import Database  # library allows async/await interaction with database which is great for FastAPI's async nature
from sqlalchemy import create_engine, MetaData  # create_engine creates connection to db; metadata holds info ab tables and schema

DATABASE_URL = "sqlite:///./tasks.db"

database = Database(DATABASE_URL)   # creates async database connection object
metadata = MetaData()   # initializes container for table definitions and schema metadata

# creates SQLAlchemy engine to interact with the db
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})