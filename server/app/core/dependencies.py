from fastapi.security import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.models import OAuthFlowPassword
from fastapi.openapi.models import SecuritySchemeType
from fastapi.openapi.models import OAuth2 as OAuth2Model
from app.core.database import SessionLocal
from fastapi.security import APIKeyHeader

# authorization
class BearerTokenOnly(OAuth2):
    def __init__(self, tokenUrl: str):
        flows = OAuthFlowsModel(password=OAuthFlowPassword(tokenUrl=tokenUrl))
        super().__init__(flows=flows, scheme_name="OAuth2PasswordBearer")

oauth2_scheme = APIKeyHeader(name="Authorization")

# db connection
def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
 


