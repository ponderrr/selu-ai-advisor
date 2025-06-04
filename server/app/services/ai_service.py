import json
import logging
import httpx
from typing import Dict, Any, AsyncGenerator, List # Import AsyncGenerator and List

from app.core.config import settings 

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL 
        self.model = settings.OLLAMA_MODEL
        self.client = httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT)
    
    async def health_check(self) -> bool:
        """Check if Ollama service is running and configured model is available."""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status() 
            models_response = response.json()
            models = models_response.get("models", [])
            return any(self.model in m['name'] for m in models) 

        except httpx.RequestError as e:
            logger.error(f"Ollama health check failed due to request error: {e}")
            return False
        except json.JSONDecodeError:
            logger.error(f"Ollama health check received invalid JSON response.")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during Ollama health check: {str(e)}")
            return False

    async def chat_stream(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """
        Send a chat request to Ollama and stream the response.
        
        Args:
            messages: A list of message dictionaries (e.g., [{"role": "user", "content": "hello"}])
                      This will include system messages and conversation history.
        Yields:
            str: Chunks of the AI's response text.
        """
        url = f"{self.base_url}/api/chat"
        headers = {"Content-Type": "application/json"}

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True, 
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            }
        }
        try:
            async with self.client.stream("POST", url, headers=headers, json=payload, timeout=settings.OLLAMA_TIMEOUT) as response:
                response.raise_for_status()

                buffer = ""
                async for chunk in response.aiter_bytes():
                    buffer += chunk.decode("utf-8")
                    
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        if line.strip():
                            try:
                                json_data = json.loads(line)
                                content_chunk = json_data.get("message", {}).get("content", "")
                                if content_chunk:
                                    yield content_chunk
                                    
                                if json_data.get("done"):
                                    return 
                                    
                            except json.JSONDecodeError:
                                logger.warning(f"Failed to decode JSON from Ollama stream: {line.strip()}")
                            except Exception as parse_error:
                                logger.error(f"Error processing stream chunk: {parse_error} in line: {line.strip()}")
        
        except httpx.TimeoutException:
            logger.error("Ollama streaming request timed out.")
            yield "ERROR: AI service timed out. Please try again."
        except httpx.RequestError as e:
            logger.error(f"Ollama streaming request failed: {e}")
            yield f"ERROR: Could not connect to AI service: {e}"
        except Exception as e:
            logger.error(f"Unexpected error during Ollama streaming: {str(e)}")
            yield f"ERROR: An unexpected error occurred: {str(e)}"

ollama_service = OllamaService()