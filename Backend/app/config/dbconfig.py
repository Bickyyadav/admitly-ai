import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User, Call, CallAnalysis
from dotenv import load_dotenv


load_dotenv()

client = None
db = None

async def connect_db():
    global client, db

    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client[os.getenv("DATABASE_NAME")]

    if not hasattr(type(client), "append_metadata"):
        type(client).append_metadata = lambda self, *args, **kwargs: None

    await init_beanie(database=db, document_models=[User, Call, CallAnalysis])

async def close_db():
    global client
    if client:
        client.close()


# @app.on_event("shutdown")
# async def shutdown():
#     client.close()

