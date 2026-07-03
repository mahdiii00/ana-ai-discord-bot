import Groq from 'groq-sdk';
import { config } from '../config/index.js';

export const groq = new Groq({ apiKey: config.groq.apiKey });
