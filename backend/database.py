import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")  # now points to Postgres

# No SQLite‑specific connect_args anymore
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,       # keeps stale connections from breaking requests
    pool_size=10,             # adjust for your traffic
    max_overflow=20,          # extra connections beyond pool_size
    echo=False,               # set True to log SQL in dev
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
