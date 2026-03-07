export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  sample_count?: number;
  sample_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export const ollamaService = {
  async chat(messages: OllamaMessage[], stream = false, signal?: AbortSignal): Promise<OllamaChatResponse | ReadableStream> {
    const url = localStorage.getItem('ollama_url') || 'http://localhost:11434';
    const model = localStorage.getItem('ollama_model') || 'llama3';

    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
        options: {
          temperature: 0.1, // Lower temperature for more consistent JSON/Proposal generation
          num_ctx: 16384, // Larger context for complex projects
          top_p: 0.9,
          num_predict: 2048,
        },
        keep_alive: '5m', // Keep model in memory for 5 minutes
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama error: ${error}`);
    }

    if (stream) {
      return response.body!;
    }

    return await response.json();
  },

  async listModels() {
    const url = localStorage.getItem('ollama_url') || 'http://localhost:11434';
    const response = await fetch(`${url}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch models');
    return await response.json();
  }
};
