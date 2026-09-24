const STORAGE_KEY = 'blue-sun-attribution-v1';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const SENSITIVE_KEY_PATTERN = /(^|_)(token|access_token|refresh_token|password|auth|code|state|session|secret)($|_)/i;

export type TouchKind = 'first_touch' | 'latest_touch';

export type AttributionTouch = {
  capturedAt: number;
  params: Record<string, string[]>;
};

export type AttributionStore = Partial<Record<TouchKind, AttributionTouch>>;

function isClient() {
  return typeof window !== 'undefined';
}

function isFresh(touch: AttributionTouch | undefined, now = Date.now()) {
  return Boolean(touch && now - touch.capturedAt < MAX_AGE_MS);
}

function readStore(): AttributionStore {
  if (!isClient()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as AttributionStore;
    const now = Date.now();
    const store: AttributionStore = {};

    for (const kind of ['first_touch', 'latest_touch'] as const) {
      if (isFresh(parsed[kind], now)) store[kind] = parsed[kind];
    }

    return store;
  } catch {
    return {};
  }
}

function writeStore(store: AttributionStore) {
  if (!isClient()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage may be unavailable in private browsing or restricted webviews.
  }
}

function readAllowedParams(search: string): Record<string, string[]> {
  const params: Record<string, string[]> = {};

  for (const [key, value] of new URLSearchParams(search)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    (params[key] ??= []).push(value);
  }

  return params;
}

function hasParams(params: Record<string, string[]>) {
  return Object.keys(params).length > 0;
}

function toSearchParams(params: Record<string, string[]>) {
  const searchParams = new URLSearchParams();

  for (const [key, values] of Object.entries(params)) {
    for (const value of values) searchParams.append(key, value);
  }

  return searchParams;
}

export function getTrackingParamsFromStore(
  store: AttributionStore,
  kind: TouchKind = 'latest_touch',
) {
  return toSearchParams(store[kind]?.params ?? {});
}

export function captureTrackingParams(): AttributionStore {
  if (!isClient()) return {};

  const currentParams = readAllowedParams(window.location.search);
  const existing = readStore();
  const now = Date.now();
  const next: AttributionStore = { ...existing };

  if (hasParams(currentParams)) {
    if (!existing.first_touch) {
      next.first_touch = { capturedAt: now, params: currentParams };
    }

    next.latest_touch = { capturedAt: now, params: currentParams };
    writeStore(next);
  }

  return next;
}

export function getStoredTrackingParams(kind: TouchKind = 'latest_touch') {
  return getTrackingParamsFromStore(readStore(), kind);
}

export function mergeParamsIntoUrl(
  destination: string,
  params = getStoredTrackingParams(),
) {
  if (!destination || destination.startsWith('#')) return destination;
  if (/^(mailto:|tel:|sms:|javascript:)/i.test(destination)) return destination;

  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(destination) || destination.startsWith('//');
  const base = isClient() ? window.location.origin : 'https://blue-sun.local';
  const url = new URL(destination, base);
  const destinationKeys = new Set(url.searchParams.keys());

  for (const [key, value] of params) {
    if (!destinationKeys.has(key)) url.searchParams.append(key, value);
  }

  if (isAbsolute) return url.toString();
  return `${url.pathname}${url.search}${url.hash}`;
}

export function mergeParamsIntoCalLink(
  calLink: string,
  params = getStoredTrackingParams(),
) {
  if (!calLink) return calLink;

  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(calLink) || calLink.startsWith('//');
  const base = isClient() ? window.location.origin : 'https://blue-sun.local';
  const url = new URL(calLink, base);
  const destinationKeys = new Set(url.searchParams.keys());

  for (const [key, value] of params) {
    if (!destinationKeys.has(key)) url.searchParams.append(key, value);
  }

  if (isAbsolute) return url.toString();

  const path = calLink.startsWith('/') ? url.pathname : url.pathname.replace(/^\/+/, '');
  return `${path}${url.search}${url.hash}`;
}

function decorateTrackingLink(link: HTMLAnchorElement, params: URLSearchParams) {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || link.dataset.noAttribution !== undefined) return;

  const decorated = mergeParamsIntoUrl(href, params);
  if (decorated !== href) link.setAttribute('href', decorated);
}

export function decorateTrackingLinks(
  root: ParentNode = document,
  params = getStoredTrackingParams(),
) {
  const links = root.querySelectorAll<HTMLAnchorElement>('a[href]');

  links.forEach((link) => decorateTrackingLink(link, params));
}

export function installTrackingLinkDecoration(
  root: Document = document,
  params = getStoredTrackingParams(),
) {
  decorateTrackingLinks(root, params);

  const handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest<HTMLAnchorElement>('a[href]');
    if (!link || !root.contains(link)) return;

    decorateTrackingLink(link, params);
  };

  root.addEventListener('click', handleClick, true);

  return () => root.removeEventListener('click', handleClick, true);
}
