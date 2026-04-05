/** Doc section slugs and routes — keep in sync with DocsLayout switch and searchIndex. */
export const DOCS_NAV = [
  { slug: 'overview', label: 'Overview', path: '/docs/overview' },
  { slug: 'integration', label: 'Integration', path: '/docs/integration' },
  { slug: 'endpoints', label: 'Endpoints', path: '/docs/endpoints' },
  { slug: 'models', label: 'Session & steps', path: '/docs/models' },
  { slug: 'environment', label: 'Environment', path: '/docs/environment' },
] as const;

export type DocSlug = (typeof DOCS_NAV)[number]['slug'];

export const VALID_DOC_SLUGS = new Set<string>(DOCS_NAV.map((n) => n.slug));
