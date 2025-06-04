from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship

class Concentration(Base):
    __tablename__ = "concentrations"
    id = Column(Integer, primary_key=True, index=True)
    major_id = Column(Integer, ForeignKey("majors.id"), nullable=False)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    major = relationship("Major", backref="concentrations") 

    def __repr__(self):
        return f"<Concentration: {self.name}>"