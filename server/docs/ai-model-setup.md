# AI Model Setup Documentation

## Ollama + Mistral 7B Setup ✅

### Installation Complete

- ✅ Ollama installed and running
- ✅ Mistral 7B model downloaded (4.1GB)
- ✅ API endpoint accessible at `http://localhost:11434`

### Performance Metrics

- **Model**: Mistral 7B (Q4_0 quantized)
- **Memory Usage**: ~4-6GB RAM
- **Response Times**:
  - Short responses: ~38 seconds
  - Detailed responses: ~45 seconds
- **Quality**: Excellent for academic advising context

### API Integration

- **Health Check**: `GET /chat/health`
- **Test Endpoint**: `GET /chat/test`
- **Main Chat**: `POST /chat/` (requires authentication)
- **Direct Ollama**: `http://localhost:11434/api/generate`

### Testing Commands

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test basic generation
curl http://localhost:11434/api/generate -d "{\"model\": \"mistral\", \"prompt\": \"Hello\", \"stream\": false}"

# Test FastAPI integration
curl http://localhost:8000/chat/health
curl http://localhost:8000/chat/test
```

### System Message Configuration

The AI is configured with SELU-specific context:

- Acts as SELU Computer Science academic advisor
- Personalizes responses with student's name
- Provides course planning and degree guidance
- Acknowledges when SELU-specific info isn't available
- Suggests contacting human advisors for unknown policies

### Known Limitations

- **CPU-only**: Slower responses (30-60 seconds typical)
- **General Knowledge**: Doesn't know SELU-specific curriculum yet
- **No Memory**: Each conversation is independent
- **No Streaming**: Full response generated before returning

### Next Steps

- [ ] Add SELU course catalog (RAG implementation)
- [ ] Implement streaming responses for better UX
- [ ] Add conversation history/context
- [ ] Fine-tune for academic advising tone
- [ ] Connect to student course data

### Troubleshooting

| Issue                | Solution                               |
| -------------------- | -------------------------------------- |
| "Connection refused" | Ensure `ollama serve` is running       |
| "Model not found"    | Run `ollama pull mistral`              |
| Slow responses       | Normal on CPU - add loading indicators |
| Out of memory        | Close other apps, restart Ollama       |
| API timeout          | Increase timeout in ai_service.py      |

### Team Deployment

1. Install Ollama: Download from https://ollama.ai/download
2. Pull model: `ollama pull mistral`
3. Verify: `ollama list` should show mistral:latest
4. Start FastAPI with AI service integration

### Dependencies Added

```txt
requests==2.31.0
```

### File Structure

```
server/
├── app/
│   ├── services/
│   │   ├── __init__.py
│   │   └── ai_service.py
│   └── api/
│       └── endpoints/
│           └── chat.py
└── docs/
    └── ai-model-setup.md
```
