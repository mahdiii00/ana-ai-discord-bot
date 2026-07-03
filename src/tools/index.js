import { registerModerationTools } from './moderation.js';
import { registerManagementTools } from './management.js';
import { registerInformationTools } from './information.js';
import { registerSecurityTools } from './security.js';

export function registerAllTools(registry) {
  registerModerationTools(registry);
  registerManagementTools(registry);
  registerInformationTools(registry);
  registerSecurityTools(registry);
}
