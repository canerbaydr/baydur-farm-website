const ORIGINS = new Set(['https://baydurfarm.com', 'https://www.baydurfarm.com']);
const LIMITS = {business:120, person:120, email:254, phone:30, product:120, quantity:200, city:80, district:80, address:700, discount_code:24, message:4000};
const REQUIRED = ['business','person','email','phone','product','quantity','city','district','address','message'];

function reply(data, status, origin) {
  return Response.json(data, {status, headers:{
    'Access-Control-Allow-Origin': origin || 'https://baydurfarm.com',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Max-Age':'3600',
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff',
    Vary:'Origin'
  }});
}

export function validateQuote(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid-request');
  if (input._honey || !/^[a-f0-9-]{36}$/i.test(input.requestId || '')) throw new Error('invalid-request');
  const values = {};
  for (const [name, limit] of Object.entries(LIMITS)) {
    const value = typeof input[name] === 'string' ? input[name].trim() : '';
    if (value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error('invalid-fields');
    values[name] = value;
  }
  if (REQUIRED.some(name => !values[name])) throw new Error('missing-fields');
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(values.email)) throw new Error('invalid-email');
  if (values.address.length < 10 || values.message.length < 3) throw new Error('invalid-fields');
  return {requestId:input.requestId, ...values};
}

async function readJson(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid-request');
  const chunks = [];
  let size = 0;
  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16000) { await reader.cancel(); throw new Error('request-too-large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function handleRequest(request, env, {fetchImpl = fetch, timeoutMs = 20000} = {}) {
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/health') {
    return Response.json({service:'baydurfarm-mail', ready:Boolean(env.GOOGLE_SCRIPT_URL && env.MAIL_SIGNING_KEY)}, {headers:{'Cache-Control':'no-store'}});
  }
  if (url.pathname !== '/quote') return reply({success:false,code:'not-found'},404,origin);
  if (!ORIGINS.has(origin)) return reply({success:false,code:'origin-not-allowed'},403);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:reply({},200,origin).headers});
  if (request.method !== 'POST') return reply({success:false,code:'method-not-allowed'},405,origin);
  if (!env.GOOGLE_SCRIPT_URL || !env.MAIL_SIGNING_KEY) return reply({success:false,code:'mail-not-configured'},503,origin);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply({success:false,code:'invalid-content-type'},415,origin);
  if (env.MAIL_RATE_LIMIT) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipLimit = await env.MAIL_RATE_LIMIT.limit({key:'ip:'+ip});
    if (!ipLimit.success) return reply({success:false,code:'rate-limited'},429,origin);
  }
  let quote;
  try { quote = validateQuote(await readJson(request)); }
  catch { return reply({success:false,code:'invalid-fields'},400,origin); }
  try {
    const payload = JSON.stringify({quote, timestamp:Date.now()});
    const key = await crypto.subtle.importKey('jwk', JSON.parse(env.MAIL_SIGNING_KEY), {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}, false, ['sign']);
    const signatureBytes = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(payload));
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const response = await fetchImpl(env.GOOGLE_SCRIPT_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({payload,signature}),
      redirect:'follow',
      signal:AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) throw new Error('upstream-error');
    const result = await response.json();
    if (result.success !== true || result.requestId !== quote.requestId) {
      return reply({success:false,code:result.code === 'quota-exceeded' ? 'quota-exceeded':'delivery-failed'},503,origin);
    }
    return reply({success:true,requestId:quote.requestId},200,origin);
  } catch { return reply({success:false,code:'delivery-unconfirmed'},502,origin); }
}

export default {fetch(request, env) { return handleRequest(request, env); }};
