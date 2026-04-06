import asyncio
from app.config.dbconfig import connect_db
from app.models.user import User, Call

async def main():
    await connect_db()
    users = await User.all().to_list()
    print(f'Total Users: {len(users)}')
    print([u.name for u in users])
    calls = await Call.all().to_list()
    print(f'Total Calls: {len(calls)}')

asyncio.run(main())
