import requests
import json
import time
from typing import Dict, Any
import logging
import httpx

# Initialize logger
logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "mistral"
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def chat(self, prompt: str, system_message: str = None) -> Dict[str, Any]:
        """
        Send a chat request to Ollama Mistral model
        """
        start_time = time.time()
        
        try:
            # Prepare the prompt with system context if provided
            full_prompt = prompt
            if system_message:
                full_prompt = f"System: {system_message}\n\nUser: {prompt}"
            
            payload = {
                "model": self.model,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 1000
                }
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=payload
            )
            
            # rest of the method remains the same
            end_time = time.time()
            response_time = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "response": result.get("response", ""),
                    "model": result.get("model", ""),
                    "response_time": round(response_time, 2)
                }
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return {
                    "success": False,
                    "error": f"API error: {response.status_code}",
                    "response_time": round(response_time, 2)
                }
                
        except requests.exceptions.Timeout:
            logger.error("Ollama request timeout")
            return {
                "success": False,
                "error": "Request timeout - AI model is taking too long to respond"
            }
        except Exception as e:
            logger.error(f"Ollama service error: {str(e)}")
            return {
                "success": False,
                "error": f"AI service error: {str(e)}"
            }
    
    def health_check(self) -> bool:
        """Check if Ollama service is running and model is available"""
        try:
            # Check if service is up
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code != 200:
                return False
            
            # Check if our model is available
            models_response = response.json()
            models = models_response.get("models", [])
            model_names = [model.get("name", "") for model in models]
            return any("mistral" in name for name in model_names)
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False

# Global instance
ollama_service = OllamaService()