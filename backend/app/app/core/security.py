from datetime import datetime, timedelta
from typing import Any, Union
from OpenSSL import crypto
from jose import jwt
from passlib.context import CryptContext
from typing import Optional, Dict, Tuple
from fastapi import HTTPException, Request, status
from fastapi.security import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security.utils import get_authorization_scheme_param
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = ("HS256", "RS256")

class OAuth2TwoTokensBearer(OAuth2):
    '''
    Override OAuth2 class based on FastAPI's OAuth2PasswordBearer to support two tokens bearer to authorise either NEF or CAPIF jtw tokens

    This implementation takes the Authorization header and splits the token parameter into two tokens, assuming they are separated by a comma. It returns a tuple containing the two tokens.
    '''
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: Optional[str] = None,
        scopes: Optional[Dict[str, str]] = None,
        description: Optional[str] = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(
            flows=flows,
            scheme_name=scheme_name,
            description=description,
            auto_error=auto_error,
        )

    async def __call__(self, request: Request) -> Optional[Tuple[str, str]]:
        authorization: str = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None

        try:
            nef_token, capif_token = param.split(',')
            print("Parameter splitted")
        except ValueError as ex:
            return {"token" : param}
        
        return {"nef_token" : nef_token, "capif_token" : capif_token}
    

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM[0])
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def extract_public_key(cert_path: str):
    try:
        with open(cert_path, 'r') as f:
            cert = f.read()
    except FileNotFoundError as e:
        print(e)
        
    crtObj = crypto.load_certificate(crypto.FILETYPE_PEM, cert)
    pubKeyObject = crtObj.get_pubkey()
    pubKeyString = crypto.dump_publickey(crypto.FILETYPE_PEM,pubKeyObject)
    return pubKeyString