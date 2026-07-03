import Groq from 'groq-sdk';

export class GroqProvider {
  constructor(apiKey, model = 'llama-3.3-70b-versatile') {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async generate(systemPrompt, messages) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from LLM');

    try {
      return JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON response from LLM');
    }
  }
}
