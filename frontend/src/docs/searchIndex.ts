/** Search targets for Cmd+K — update when API sections change. */
export interface DocSearchItem {
  id: string;
  title: string;
  path: string;
  keywords: string[];
}

export const DOC_SEARCH_INDEX: DocSearchItem[] = [
  {
    id: 'overview',
    title: 'Overview',
    path: '/docs/overview',
    keywords: ['forge', 'browser', 'playwright', 'template', 'self-improve', 'learn', 'cdp', 'agent'],
  },
  {
    id: 'integration',
    title: 'Integration',
    path: '/docs/integration',
    keywords: ['base url', 'vite', 'poll', 'status', 'session', 'ttl', 'gc', 'task', 'json', 'request'],
  },
  {
    id: 'endpoints',
    title: 'Endpoints',
    path: '/docs/endpoints',
    keywords: ['api', 'post', 'get', 'delete', 'chat', 'learn', 'compare', 'baseline', 'forge', 'health', 'templates'],
  },
  {
    id: 'models',
    title: 'Session & steps',
    path: '/docs/models',
    keywords: ['sessionstatus', 'stepinfo', 'poll', 'payload', 'phase', 'steps', 'live_url'],
  },
  {
    id: 'environment',
    title: 'Environment',
    path: '/docs/environment',
    keywords: ['cors', 'supabase', 'browser_use', 'api key', 'env', 'secrets', 'server'],
  },
  // Extra entry points for common endpoint names (navigate to Endpoints page)
  {
    id: 'ep-chat',
    title: 'POST /chat',
    path: '/docs/endpoints',
    keywords: ['chat', 'auto', 'forge', 'baseline'],
  },
  {
    id: 'ep-status',
    title: 'GET /status/{session_id}',
    path: '/docs/endpoints',
    keywords: ['status', 'poll', 'session_id'],
  },
];
