import { groq } from './client.js';
import { config } from '../config/index.js';
import { SYSTEM_PROMPT } from './prompts.js';

export async function parseIntent(input, username = 'unknown', context = '') {
  try {
    let userMessage = `User "${username}" said: "${input}"`;
    if (context) {
      userMessage = `Recent conversation:\n${context}\n\nNew message from ${username}: "${input}"`;
    }

    const completion = await groq.chat.completions.create({
      model: config.groq.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 350,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    return JSON.parse(content);
  } catch (error) {
      console.error('[IntentParser] Error:', error.message);
      return { action: 'unknown', message: 'Failed to parse intent: ' + error.message };
  }
}
