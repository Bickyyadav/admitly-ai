


class admin(Document):
    name: str
    email: str
    password: str
    
    
    class Settings:
        name = "admins"