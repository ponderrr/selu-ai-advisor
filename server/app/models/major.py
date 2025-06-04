from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    total_credits_required = Column(Integer, nullable=True)
    def __repr__(self):
        return f"<Major: {self.name}>"