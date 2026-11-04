const ENDPOINT = 'https://baydurfarm-mail.canerbaydurr.workers.dev/quote';

const messages = {
  tr: {
    pending: 'Talebiniz gönderiliyor…',
    success: 'Talebiniz gönderim servisine iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
    failure: 'Gönderim tamamlanamadı. Bilgileriniz formda duruyor. Lütfen tekrar deneyin.'
  },
  en: {
    pending: 'Sending your request…', success: 'Your request was accepted by the delivery service. We will contact you shortly.',
    failure: 'Your request could not be sent. Your information is still in the form. Please try again.'
  },
  de: {
    pending: 'Ihre Anfrage wird gesendet…', success: 'Ihre Anfrage wurde angenommen. Wir melden uns in Kürze.',
    failure: 'Ihre Anfrage konnte nicht gesendet werden. Ihre Angaben bleiben im Formular. Bitte versuchen Sie es erneut.'
  },
  es: {
    pending: 'Enviando su solicitud…', success: 'Su solicitud fue aceptada. Nos pondremos en contacto pronto.',
    failure: 'No se pudo enviar su solicitud. Sus datos siguen en el formulario. Inténtelo de nuevo.'
  },
  fr: {
    pending: 'Envoi de votre demande…', success: 'Votre demande a été acceptée. Nous vous contacterons prochainement.',
    failure: 'Votre demande n’a pas pu être envoyée. Vos informations restent dans le formulaire. Veuillez réessayer.'
  }
};

const fieldNames = ['business', 'person', 'email', 'phone', 'product', 'quantity', 'city', 'district', 'address', 'discount_code', 'message'];

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
  form.append(feedback);

  const readValues = () => Object.fromEntries(new FormData(form));
  function showFeedback(message, kind) {
    feedback.textContent = message;
    feedback.dataset.state = kind;
    feedback.hidden = false;
  }
  function edited() {
    if (state === 'success') {
      state = 'idle';
      previousAttempt = null;
      submit.disabled = false;
      feedback.hidden = true;
    }
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
    showFeedback(text.pending, 'pending');
    try {
      await submitQuote(values, {requestId:previousAttempt.requestId});
      state = JSON.stringify(readValues()) === JSON.stringify(values) ? 'success' : 'idle';
      showFeedback(text.success, 'success');
    } catch {
      state = 'error';
      showFeedback(text.failure, 'error');
    } finally {
      submit.disabled = state === 'success';
      submit.textContent = originalLabel;
      form.removeAttribute('aria-busy');
    }
  });
}

if (typeof document !== 'undefined') setupQuoteForm();
