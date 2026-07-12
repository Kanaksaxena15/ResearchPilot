import logging
import warnings

# Suppress warnings and noise from the Watsonx SDK or HTTP client
warnings.filterwarnings("ignore")
logging.getLogger("ibm_watsonx_ai").setLevel(logging.ERROR)

from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from ibm_watsonx_ai.wml_client_error import WMLClientError
from app.config import Config
from app.services.prompts import SUMMARY_PROMPT_TEMPLATE, QA_PROMPT_TEMPLATE, INSIGHTS_PROMPT_TEMPLATE

logger = logging.getLogger("app.services.ibm")

class IBMGraniteService:
    _instance = None
    _model = None
    _active_model_id = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(IBMGraniteService, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        # Prevent re-initialization if already set
        if self._model is not None:
            return

        # Try to initialize model if credentials are present
        if Config.IBM_API_KEY and Config.IBM_PROJECT_ID:
            try:
                self._initialize_model()
            except Exception as e:
                logger.error(f"Deferred initialization failed on startup: {str(e)}")
        else:
            logger.warning("IBM Watsonx API Key or Project ID is missing. Model initialization is deferred until lazy-loaded.")

    def _initialize_model(self):
        credentials = {
            "url": Config.IBM_URL,
            "apikey": Config.IBM_API_KEY
        }

        # Query supported chat models from Watsonx first to avoid loading unsupported models
        supported_model_ids = set()
        try:
            from ibm_watsonx_ai import APIClient
            client = APIClient(credentials)
            client.set.default_project(Config.IBM_PROJECT_ID)
            specs = client.foundation_models.get_chat_model_specs()
            for spec in specs.get("resources", []):
                model_id_val = spec.get("model_id")
                if model_id_val:
                    supported_model_ids.add(model_id_val)
            logger.info(f"Dynamically fetched supported chat models from Watsonx: {list(supported_model_ids)}")
        except Exception as e:
            logger.warning(f"Could not dynamically query supported models (falling back to default sequence): {str(e)}")

        candidates = [
            Config.IBM_MODEL_ID,
            "ibm/granite-4-h-small",
            "ibm/granite-3-1-8b-base",
            "ibm/granite-8b-code-instruct"
        ]

        # De-duplicate while preserving order
        seen = set()
        candidates = [x for x in candidates if x and not (x in seen or seen.add(x))]

        # Filter candidates by supported model IDs if available
        models_to_try = []
        for model_id in candidates:
            if not supported_model_ids or model_id in supported_model_ids:
                models_to_try.append(model_id)
            else:
                logger.info(f"Skipping initialization for model '{model_id}' as it is not supported in this Watsonx environment.")

        # Fallback if no models matched the supported set
        if not models_to_try:
            models_to_try = candidates

        last_error = None
        for model_id in models_to_try:
            try:
                logger.info(f"Attempting to initialize IBM Watsonx model: '{model_id}'...")
                self._model = ModelInference(
                    model_id=model_id,
                    credentials=credentials,
                    project_id=Config.IBM_PROJECT_ID
                )
                self._active_model_id = model_id
                logger.info(f"Successfully initialized IBM Granite model: {self._active_model_id}")
                return
            except Exception as e:
                logger.info(f"Model '{model_id}' was not loaded (checking next option if available): {str(e)}")
                last_error = e

        # If we got here, all attempts failed
        self._model = None
        logger.error(f"IBM Granite models could not be initialized. Status: unavailable. Detail: {str(last_error)}")
        raise RuntimeError(f"Watsonx models could not be initialized: {str(last_error)}")

    def get_model(self) -> ModelInference:
        if self._model is None:
            if Config.IBM_API_KEY and Config.IBM_PROJECT_ID:
                self._initialize_model()
            if self._model is None:
                raise RuntimeError(
                    "IBM Watsonx Granite model is not initialized. "
                    "Please verify that 'IBM_API_KEY' and 'IBM_PROJECT_ID' are correctly configured "
                    "in your environment variables or platform secrets."
                )
        return self._model

    def generate_summary(self, title: str, text: str) -> str:
        """
        Generate research paper summary using IBM Granite.
        """
        truncated_text = text[:12000] if text else ""
        prompt = SUMMARY_PROMPT_TEMPLATE.format(title=title, text=truncated_text)
        try:
            logger.info(f"Requesting summary from IBM Granite using active model '{self._active_model_id}' for paper: {title}")
            messages = [{"role": "user", "content": prompt}]
            chat_params = {
                "max_tokens": 1500,
                "temperature": 0.2
            }
            response = self.get_model().chat(messages=messages, params=chat_params)
            if response and "choices" in response and response["choices"]:
                content = response["choices"][0]["message"]["content"]
                return content.strip()
            raise RuntimeError("Empty response received from IBM Watsonx Chat API")
        except Exception as e:
            logger.error(f"Error generating summary from IBM Granite: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to generate summary: {str(e)}")

    def answer_question(self, text: str, question: str) -> str:
        """
        Answer questions based on paper context.
        """
        truncated_text = text[:15000] if text else ""
        prompt = QA_PROMPT_TEMPLATE.format(text=truncated_text, question=question)
        try:
            logger.info(f"Requesting question-answering from IBM Granite using active model '{self._active_model_id}' for query: '{question}'")
            messages = [{"role": "user", "content": prompt}]
            chat_params = {
                "max_tokens": 1000,
                "temperature": 0.2
            }
            response = self.get_model().chat(messages=messages, params=chat_params)
            if response and "choices" in response and response["choices"]:
                content = response["choices"][0]["message"]["content"]
                return content.strip()
            raise RuntimeError("Empty response received from IBM Watsonx Chat API")
        except Exception as e:
            logger.error(f"Error answering question via IBM Granite: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to answer question: {str(e)}")

    def generate_insights(self, title: str, text: str) -> str:
        """
        Generate Research Insights.
        """
        truncated_text = text[:12000] if text else ""
        prompt = INSIGHTS_PROMPT_TEMPLATE.format(title=title, text=truncated_text)
        try:
            logger.info(f"Requesting analytical insights from IBM Granite using active model '{self._active_model_id}' for paper: {title}")
            messages = [{"role": "user", "content": prompt}]
            chat_params = {
                "max_tokens": 1500,
                "temperature": 0.2
            }
            response = self.get_model().chat(messages=messages, params=chat_params)
            if response and "choices" in response and response["choices"]:
                content = response["choices"][0]["message"]["content"]
                return content.strip()
            raise RuntimeError("Empty response received from IBM Watsonx Chat API")
        except Exception as e:
            logger.error(f"Error generating insights via IBM Granite: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to generate insights: {str(e)}")

# Create singleton instance immediately
ibm_granite = IBMGraniteService()
