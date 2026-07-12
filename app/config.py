import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("app.config")


class Config:
    JWT_SECRET = os.getenv("JWT_SECRET", "fallback-jwt-secret-key-for-development")

    IBM_API_KEY = os.getenv("IBM_API_KEY")
    IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID")
    IBM_MODEL_ID = os.getenv("IBM_MODEL_ID", "ibm/granite-4-h-small")
    IBM_URL = os.getenv("IBM_URL", "https://us-south.ml.cloud.ibm.com")

    @classmethod
    def validate(cls):
        if not cls.JWT_SECRET:
            logger.warning("JWT_SECRET missing.")

        if not cls.IBM_API_KEY:
            logger.warning("IBM_API_KEY missing.")

        if not cls.IBM_PROJECT_ID:
            logger.warning("IBM_PROJECT_ID missing.")

        logger.info(f"IBM_URL: {cls.IBM_URL}")
        logger.info(f"IBM_MODEL_ID: {cls.IBM_MODEL_ID}")

Config.validate()