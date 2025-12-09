const DEV_FALLBACK_URL = 'http://localhost:3001';
const PROD_FALLBACK_URL = 'https://biseda-ai.onrender.com';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0'];

const getRuntimeWindow = () => {
  try {
    // Using Function constructor prevents bundlers from eagerly evaluating `window`.
    // eslint-disable-next-line no-new-func
    const globalRef = Function('return this')();
    return globalRef?.window ?? undefined;
  } catch {
    return undefined;
  }
};

const getRuntimeOverride = (runtimeWindow) => {
  if (!runtimeWindow) return undefined;
  return (
    runtimeWindow.__BISEDA_BACKEND_URL ||
    runtimeWindow.__BisedaBackendUrl ||
    runtimeWindow.__BACKEND_URL__ ||
    runtimeWindow.__ENV_BACKEND_URL__
  );
};

const isLocalHost = (hostname) =>
  LOCAL_HOSTNAMES.includes(hostname) || hostname.endsWith('.local');

/**
 * Resolve the backend URL with multiple fallbacks so production builds
 * never default to localhost when hosted under GitHub Pages or Netlify.
 */
export function getBackendUrl() {
  const runtimeWindow = getRuntimeWindow();
  if (runtimeWindow) {
    const runtimeOverride = getRuntimeOverride(runtimeWindow);
    if (runtimeOverride && runtimeOverride.trim().length > 0) {
      return runtimeOverride.trim();
    }

    return isLocalHost(runtimeWindow.location.hostname)
      ? DEV_FALLBACK_URL
      : PROD_FALLBACK_URL;
  }

  // Default to the production backend when running in build/SSR contexts.
  return PROD_FALLBACK_URL;
}


