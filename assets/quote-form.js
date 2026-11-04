const RECIPIENT = 'baydurfarm@gmail.com';
const ENDPOINT = 'https://baydurfarm-mail.canerbaydurr.workers.dev/quote';

const messages = {
  tr: {
    subject: 'Baydur Farm - Siteden yeni teklif talebi',
    fields: ['İşletme', 'Yetkili', 'E-posta', 'Telefon', 'Ürün', 'Haftalık ihtiyaç', 'İl', 'İlçe', 'Teslimat adresi', 'İndirim kodu', 'Ek not'],
    pending: 'Talebiniz gönderiliyor…',
    success: 'Talebiniz gönderim servisine iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
    failure: 'Otomatik gönderim doğrulanamadı. Bilgileriniz formda duruyor. Talebinizi aşağıdaki e-posta seçenekleriyle gönderebilirsiniz.',
    instructions: 'Dilerseniz talebinizi doğrudan e-posta ile gönderebilirsiniz. Bilgileriniz e-postaya hazırlanır; açılan pencerede Gönder düğmesine basın.',
    gmail: 'Gmail’de aç', app: 'E-posta uygulamasında aç', copy: 'Talebi kopyala',
    copied: 'Talep kopyalandı. E-postanızı baydurfarm@gmail.com adresine gönderebilirsiniz.',
    manual: 'Talebi aşağıdaki alandan kopyalayıp baydurfarm@gmail.com adresine e-posta gönderebilirsiniz.'
  },
  en: {
    subject: 'Baydur Farm - Website quote request',
    fields: ['Business', 'Contact person', 'Email', 'Phone', 'Product', 'Weekly quantity', 'Province', 'District', 'Delivery address', 'Discount code', 'Notes'],
    pending: 'Sending your request…', success: 'Your request was accepted by the delivery service. We will contact you shortly.',
    failure: 'Automatic delivery could not be confirmed. Your information is still in the form. You can send your request using the email options below.',
    instructions: 'You can also send your request directly by email. Your details will be added to an email; press Send in the window that opens.',
    gmail: 'Open Gmail', app: 'Open email app', copy: 'Copy request',
    copied: 'Request copied. You can email it to baydurfarm@gmail.com.',
    manual: 'Copy the request below and email it to baydurfarm@gmail.com.'
  },
  de: {
    subject: 'Baydur Farm - Angebotsanfrage über die Website',
    fields: ['Unternehmen', 'Ansprechpartner', 'E-Mail', 'Telefon', 'Produkt', 'Wochenbedarf', 'Provinz', 'Bezirk', 'Lieferadresse', 'Rabattcode', 'Hinweise'],
    pending: 'Ihre Anfrage wird gesendet…', success: 'Ihre Anfrage wurde angenommen. Wir melden uns in Kürze.',
    failure: 'Der automatische Versand konnte nicht bestätigt werden. Ihre Angaben bleiben im Formular. Sie können die Anfrage über die folgenden E-Mail-Optionen senden.',
    instructions: 'Sie können Ihre Anfrage auch direkt per E-Mail senden. Ihre Angaben werden übernommen; klicken Sie im geöffneten Fenster auf Senden.',
    gmail: 'Gmail öffnen', app: 'E-Mail-App öffnen', copy: 'Anfrage kopieren',
    copied: 'Anfrage kopiert. Sie können sie an baydurfarm@gmail.com senden.',
    manual: 'Kopieren Sie die Anfrage unten und senden Sie sie an baydurfarm@gmail.com.'
  },
  es: {
    subject: 'Baydur Farm - Solicitud de presupuesto desde la web',
    fields: ['Empresa', 'Persona de contacto', 'Correo', 'Teléfono', 'Producto', 'Cantidad semanal', 'Provincia', 'Distrito', 'Dirección de entrega', 'Código de descuento', 'Notas'],
    pending: 'Enviando su solicitud…', success: 'Su solicitud fue aceptada. Nos pondremos en contacto pronto.',
    failure: 'No se pudo confirmar el envío automático. Sus datos siguen en el formulario. Puede enviar la solicitud con las opciones de correo siguientes.',
    instructions: 'También puede enviar su solicitud directamente por correo. Sus datos se añadirán al mensaje; pulse Enviar en la ventana que se abra.',
    gmail: 'Abrir Gmail', app: 'Abrir aplicación de correo', copy: 'Copiar solicitud',
    copied: 'Solicitud copiada. Puede enviarla a baydurfarm@gmail.com.',
    manual: 'Copie la solicitud de abajo y envíela a baydurfarm@gmail.com.'
  },
  fr: {
    subject: 'Baydur Farm - Demande de devis depuis le site',
    fields: ['Entreprise', 'Contact', 'E-mail', 'Téléphone', 'Produit', 'Besoin hebdomadaire', 'Province', 'District', 'Adresse de livraison', 'Code de réduction', 'Notes'],
    pending: 'Envoi de votre demande…', success: 'Votre demande a été acceptée. Nous vous contacterons prochainement.',
    failure: 'L’envoi automatique n’a pas pu être confirmé. Vos informations restent dans le formulaire. Vous pouvez envoyer votre demande par les options e-mail ci-dessous.',
    instructions: 'Vous pouvez aussi envoyer votre demande directement par e-mail. Vos informations seront ajoutées au message ; cliquez sur Envoyer dans la fenêtre qui s’ouvre.',
    gmail: 'Ouvrir Gmail', app: 'Ouvrir l’application e-mail', copy: 'Copier la demande',
    copied: 'Demande copiée. Vous pouvez l’envoyer à baydurfarm@gmail.com.',
    manual: 'Copiez la demande ci-dessous et envoyez-la à baydurfarm@gmail.com.'
  }
};

const fieldNames = ['business', 'person', 'email', 'phone', 'product', 'quantity', 'city', 'district', 'address', 'discount_code', 'message'];

export function buildQuoteEmail(values, language = 'tr') {
  const text = messages[language] || messages.tr;
  const lines = fieldNames.flatMap((name, index) => {
    const value = String(values[name] || '').trim();
    return value ? [text.fields[index] + ': ' + value] : [];
  });
  const subject = text.subject;
  const body = lines.join('\n\n');
  const params = new URLSearchParams({view: 'cm', fs: '1', to: RECIPIENT, su: subject, body});
  return {
    recipient: RECIPIENT, subject, body,
    gmail: 'https://mail.google.com/mail/?' + params.toString(),
    mailto: 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
  };
}

export async function submitQuote(values, {fetchImpl = globalThis.fetch, timeoutMs = 30000, requestId = globalThis.crypto.randomUUID()} = {}) {
  if (String(values._honey || '').trim()) throw new Error('delivery-unconfirmed');
  const controller = new AbortController();
  const payload = {...Object.fromEntries(fieldNames.map(name => [name, String(values[name] ?? '')])), requestId};
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('delivery-timeout'));
    }, timeoutMs);
  });
  try {
    const request = (async () => {
      const response = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(payload),
        credentials: 'omit',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('delivery-http-error');
      const result = await response.json();
      if (result.success !== true || result.requestId !== requestId) {
        throw new Error('delivery-unconfirmed');
      }
      return result;
    })();
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function setupQuoteForm() {
  const form = document.getElementById('quoteForm');
  const submit = form?.querySelector('button[type="submit"]');
  if (!form || !submit) return;
  const language = document.documentElement.lang.toLowerCase().split('-')[0];
  const text = messages[language] || messages.tr;
  const originalLabel = submit.textContent;
  let state = 'idle';
  let previousAttempt = null;

  const feedback = document.createElement('p');
  feedback.id = 'quoteFeedback';
  feedback.className = 'quote-feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;
  const options = document.createElement('div');
  options.className = 'quote-email-options';
  options.hidden = false;
  const instructions = document.createElement('p');
  instructions.textContent = text.instructions;
  const actions = document.createElement('div');
  actions.className = 'quote-email-actions';
  const gmail = document.createElement('a');
  gmail.textContent = text.gmail;
  gmail.target = '_blank';
  gmail.rel = 'noopener noreferrer';
  const emailApp = document.createElement('a');
  emailApp.textContent = text.app;
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = text.copy;
  const manualCopy = document.createElement('textarea');
  manualCopy.readOnly = true;
  manualCopy.hidden = true;
  manualCopy.setAttribute('aria-label', text.copy);
  actions.append(gmail, emailApp, copy);
  options.append(instructions, actions, manualCopy);
  form.append(feedback, options);

  const readValues = () => Object.fromEntries(new FormData(form));
  function updateEmailOptions() {
    const email = buildQuoteEmail(readValues(), language);
    gmail.href = email.gmail;
    emailApp.href = email.mailto;
    manualCopy.value = email.recipient + '\n' + email.subject + '\n\n' + email.body;
    return email;
  }
  function showFeedback(message, kind) {
    feedback.textContent = message;
    feedback.dataset.state = kind;
    feedback.hidden = false;
  }
  updateEmailOptions();
  for (const link of [gmail, emailApp]) {
    link.addEventListener('click', event => {
      if (!form.reportValidity()) {
        event.preventDefault();
        return;
      }
      updateEmailOptions();
    });
  }
  copy.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    updateEmailOptions();
    try {
      await navigator.clipboard.writeText(manualCopy.value);
      showFeedback(text.copied, 'info');
    } catch {
      manualCopy.hidden = false;
      manualCopy.focus();
      manualCopy.select();
      showFeedback(text.manual, 'info');
    }
  });
  function edited() {
    if (state === 'success') {
      state = 'idle';
      previousAttempt = null;
      submit.disabled = false;
      feedback.hidden = true;
    }
    if (!options.hidden) updateEmailOptions();
  }
  form.addEventListener('input', edited);
  form.addEventListener('change', edited);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (state === 'pending' || state === 'success' || !form.reportValidity()) return;
    const values = readValues();
    const signature = JSON.stringify(values);
    if (previousAttempt?.signature !== signature) {
      previousAttempt = {signature, requestId:globalThis.crypto.randomUUID()};
    }
    state = 'pending';
    submit.disabled = true;
    submit.textContent = text.pending;
    form.setAttribute('aria-busy', 'true');
    options.hidden = true;
    showFeedback(text.pending, 'pending');
    try {
      await submitQuote(values, {requestId:previousAttempt.requestId});
      state = JSON.stringify(readValues()) === JSON.stringify(values) ? 'success' : 'idle';
      showFeedback(text.success, 'success');
    } catch {
      state = 'error';
      updateEmailOptions();
      options.hidden = false;
      showFeedback(text.failure, 'error');
    } finally {
      submit.disabled = state === 'success';
      submit.textContent = originalLabel;
      form.removeAttribute('aria-busy');
    }
  });
}

if (typeof document !== 'undefined') setupQuoteForm();
