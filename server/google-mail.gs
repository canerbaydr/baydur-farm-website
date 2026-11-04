/** Sends website requests only to the fixed Baydur Farm mailbox. */
const MAIL_RECIPIENT = 'baydurfarm@gmail.com';
const MAIL_PUBLIC_KEY = {n:'n0iIwYJlzoMbc8JInBRwbl8xcpwfdbpQeBKKF4B5c_7q7sNNYR_Etf_YR6vfCPtjLLluZdgzhyJKnZfN9yyBJqr_tlI_NZUPXHvIqPxzEFVjpKCpO7lT_2rH_RCYzbtoxwGSsfj8M7giRFekc4vg9LxaxAOYz4GmOY-Bv2WDtCY1zSOPXHmqi6rpK0LU99ms6ZH-Q_48czZk-vaN2btI8UQdGveUnhSt39oFq-pDTOv2wsIaHNyOU39uGv9ifL8B_TeRk615GG-oUpDC36PMfbl9WVvqmGjlZ_Y36EajLP0zmhd4M2uDdP1TM_9YZME8QJLZxIl3mAXZXZIrgOv8KQ',e:'AQAB'};
const MAIL_FIELDS = [
  ['business','İşletme'], ['person','Yetkili'], ['email','E-posta'],
  ['phone','Telefon'], ['product','Ürün'], ['quantity','Haftalık ihtiyaç'],
  ['city','İl'], ['district','İlçe'], ['address','Teslimat adresi'],
  ['discount_code','İndirim kodu'], ['message','Ek not']
];

function mailResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return mailResponse({service:'baydurfarm-mail', version:1}); }

function authorizeMail() { console.log('Gönderim kotası: ' + MailApp.getRemainingDailyQuota()); }

function bytesHex(bytes) { return bytes.map(function(b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join(''); }

// RSASSA-PKCS1-v1_5 / SHA-256: the private signing key stays in the Worker.
function verifyMailSignature(payload, signature) {
  try {
    if (typeof payload !== 'string' || typeof signature !== 'string') return false;
    const modulus = Utilities.base64DecodeWebSafe(MAIL_PUBLIC_KEY.n);
    const signatureBytes = Utilities.base64DecodeWebSafe(signature);
    if (signatureBytes.length !== modulus.length) return false;
    const n = BigInt('0x' + bytesHex(modulus));
    let base = BigInt('0x' + bytesHex(signatureBytes));
    if (base >= n) return false;
    let exponent = BigInt('0x' + bytesHex(Utilities.base64DecodeWebSafe(MAIL_PUBLIC_KEY.e)));
    let result = BigInt(1);
    while (exponent > BigInt(0)) {
      if (exponent % BigInt(2)) result = result * base % n;
      base = base * base % n;
      exponent = exponent / BigInt(2);
    }
    const hash = bytesHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payload, Utilities.Charset.UTF_8));
    const digestInfo = '3031300d060960864801650304020105000420' + hash;
    const expected = '0001' + 'ff'.repeat(modulus.length - digestInfo.length / 2 - 3) + '00' + digestInfo;
    return result.toString(16).padStart(modulus.length * 2, '0') === expected;
  } catch (_) { return false; }
}

function doPost(event) {
  const properties = PropertiesService.getScriptProperties();
  let envelope;
  try { envelope = JSON.parse(event.postData.contents); }
  catch (_) { return mailResponse({success:false,code:'invalid-request'}); }
  if (!verifyMailSignature(envelope.payload, envelope.signature)) return mailResponse({success:false,code:'unauthorized'});
  let input;
  try { input = JSON.parse(envelope.payload); }
  catch (_) { return mailResponse({success:false,code:'invalid-request'}); }
  if (!Number.isFinite(input.timestamp) || Math.abs(Date.now() - input.timestamp) > 300000) return mailResponse({success:false,code:'expired'});
  const quote = input.quote;
  if (!quote || !/^[a-f0-9-]{36}$/i.test(quote.requestId || '')) return mailResponse({success:false,code:'invalid-request'});
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(quote.email || '')) return mailResponse({success:false,code:'invalid-email'});
  if (MAIL_FIELDS.some(function(field) { return field[0] !== 'discount_code' && (typeof quote[field[0]] !== 'string' || !quote[field[0]].trim()); })) return mailResponse({success:false,code:'missing-fields'});
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return mailResponse({success:false,code:'busy'});
  try {
    let recent;
    try { recent = JSON.parse(properties.getProperty('RECENT_MAIL_REQUESTS') || '{}'); }
    catch (_) { recent = {}; }
    if (recent[quote.requestId]) return mailResponse({success:true,requestId:quote.requestId});
    if (MailApp.getRemainingDailyQuota() < 1) return mailResponse({success:false,code:'quota-exceeded'});
    const body = MAIL_FIELDS.filter(function(field) { return quote[field[0]]; }).map(function(field) {
      return field[1] + ': ' + quote[field[0]];
    }).join('\n\n') + '\n\nTalep numarası: ' + quote.requestId;
    MailApp.sendEmail({
      to: MAIL_RECIPIENT,
      subject: 'Baydur Farm - Siteden yeni teklif talebi',
      body: body,
      name: 'Baydur Farm web formu',
      replyTo: quote.email
    });
    const now = Date.now();
    recent[quote.requestId] = now;
    const ids = Object.keys(recent).filter(function(id) { return now - recent[id] < 86400000; }).sort(function(a,b) { return recent[b] - recent[a]; }).slice(0,120);
    const kept = {};
    ids.forEach(function(id) { kept[id] = recent[id]; });
    properties.setProperty('RECENT_MAIL_REQUESTS', JSON.stringify(kept));
    return mailResponse({success:true,requestId:quote.requestId});
  } catch (_) { return mailResponse({success:false,code:'delivery-failed'}); }
  finally { lock.releaseLock(); }
}
