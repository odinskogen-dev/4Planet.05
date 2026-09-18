const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://ghvdzetmplqkdtfqiror.supabase.co').replace(/\/$/, '');
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE';
const SESSION_KEY = '4planet.companyBrain.session.v1';

export type BrainSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type?: string;
};

export type CompanyWorkspace = {
  company_id: string;
  display_name: string;
  legal_name?: string | null;
  claim_state?: string;
  role: string;
  updated_at?: string;
};

export type CompanyBrainSnapshot = {
  company: Record<string, unknown>;
  member_role: string;
  memories: Array<Record<string, unknown>>;
  metrics: Array<Record<string, unknown>>;
  opportunities: Array<Record<string, unknown>>;
  decisions: Array<Record<string, unknown>>;
  interventions: Array<Record<string, unknown>>;
  results: Array<Record<string, unknown>>;
  learning: Array<Record<string, unknown>>;
  retrieved_at: string;
};

function authHeaders(accessToken?: string) {
  return {
    apikey: PUBLISHABLE_KEY,
    'content-type': 'application/json',
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
  };
}

function readStoredSession(): BrainSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrainSession;
    if (!parsed.access_token || !parsed.refresh_token || !parsed.expires_at) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: BrainSession | null) {
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function consumeAuthCallback(): BrainSession | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  const expiresIn = Number(hash.get('expires_in') || '3600');
  if (!accessToken || !refreshToken) return readStoredSession();
  const session: BrainSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + Math.max(60, expiresIn),
    token_type: hash.get('token_type') || 'bearer',
  };
  writeSession(session);
  const clean = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, clean);
  return session;
}

async function refreshSession(session: BrainSession): Promise<BrainSession> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || typeof payload.access_token !== 'string' || typeof payload.refresh_token !== 'string') {
    writeSession(null);
    throw new Error('Company Brain session expired. Sign in again.');
  }
  const next: BrainSession = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
    token_type: String(payload.token_type || 'bearer'),
  };
  writeSession(next);
  return next;
}

export async function currentSession(): Promise<BrainSession | null> {
  const session = consumeAuthCallback();
  if (!session) return null;
  if (session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;
  return refreshSession(session);
}

export async function sendCompanyBrainMagicLink(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('Enter a valid email.');
  const redirect = `${window.location.origin}/4brand`;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(redirect)}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email: cleanEmail, create_user: false }),
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(payload.msg || payload.message || payload.error_description || 'Could not send sign-in link.'));
}

export async function signOutCompanyBrain() {
  const session = await currentSession().catch(() => null);
  if (session) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: authHeaders(session.access_token),
    }).catch(() => undefined);
  }
  writeSession(null);
}

async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const session = await currentSession();
  if (!session) throw new Error('AUTH_REQUIRED');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      ...authHeaders(session.access_token),
      prefer: 'return=representation',
    },
    body: JSON.stringify(args),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload && typeof payload === 'object' ? (payload as Record<string, unknown>).message || (payload as Record<string, unknown>).hint : null;
    throw new Error(String(detail || `${name} failed`));
  }
  return payload as T;
}

export async function listCompanyBrainWorkspaces() {
  return rpc<CompanyWorkspace[]>('four_brands_company_brain_list_workspaces');
}

export async function createCompanyBrainWorkspace(displayName: string, legalName?: string) {
  return rpc<{ company_id: string }>('four_brands_company_brain_create_workspace', {
    p_display_name: displayName,
    p_legal_name: legalName || null,
  });
}

export async function loadCompanyBrain(companyId: string) {
  return rpc<CompanyBrainSnapshot>('four_brands_company_brain_snapshot', { p_company_id: companyId });
}

export async function saveCompanyTwin(companyId: string, twin: Record<string, string>) {
  return rpc<CompanyBrainSnapshot>('four_brands_company_brain_save_twin', {
    p_company_id: companyId,
    p_twin: twin,
  });
}

export async function syncCompanyAnalysis(companyId: string, analysis: unknown, ledger: Record<string, string>) {
  return rpc<CompanyBrainSnapshot>('four_brands_company_brain_sync_analysis', {
    p_company_id: companyId,
    p_analysis: analysis,
    p_ledger: ledger,
  });
}

export async function companyValueReport(companyId: string) {
  return rpc<Record<string, unknown>>('four_brands_company_value_report', { p_company_id: companyId });
}

export async function companyCompoundingMetrics(companyId: string) {
  return rpc<Record<string, unknown>>('four_brands_compounding_metrics', { p_company_id: companyId });
}
