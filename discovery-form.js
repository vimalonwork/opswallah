// ==========================================================================
// OpsWallah — Discovery Session Booking Form (discovery_form.html)
// ==========================================================================
// This is the same submission logic that previously lived inside script.js
// on the homepage. Field names, endpoint, and payment link are unchanged.
//
// CONFIGURATION
// 1) formEndpoint must be the live Google Apps Script Web App URL, ending
//    in /exec.
// 2) paymentUrl must stay pointed to the live Razorpay ₹29 Payment Link.
// Do not place any secret API keys in this frontend file.
// --------------------------------------------------------------------------
const OPSWALLAH_FORM_CONFIG = {
  formEndpoint: 'https://script.google.com/macros/s/AKfycbztswoF76W0qgMEzoYunSig21aVvXH-F5KJCd2Ma8xWEeZG8Qy6uq8Hc2cFEYAn_irK/exec',
  paymentUrl: 'https://rzp.io/rzp/opswallah-discovery-session',
};

const isConfiguredHttpUrl = (value) => {
  if (!value || typeof value !== 'string') return false;

  const normalized = value.trim();

  if (
    normalized.includes('YOUR_') ||
    normalized.includes('REPLACE_WITH') ||
    normalized.includes('PASTE_')
  ) {
    return false;
  }

  try {
    const parsed = new URL(normalized);

    return (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:'
    );
  } catch {
    return false;
  }
};

document.addEventListener('DOMContentLoaded', () => {

  if (window.lucide) {
    lucide.createIcons();
  }

  // ---- Single-step Discovery Session form ----
  // Only Name / WhatsApp / Email / Consent / Acknowledgement are collected
  // here, at the moment of booking. Everything else (education, program
  // interest, career challenge, lead source) is collected AFTER payment
  // via a separate Google Form / WhatsApp, linked back to this Lead ID.
  const form = document.getElementById('discoveryForm');
  if (form) {
    const submitBtn = document.getElementById('discoverySubmitBtn');
    const statusEl = document.getElementById('discoveryFormStatus');
    const successState = document.getElementById('formSuccessState');
    const paymentBtn = document.getElementById('paymentContinueBtn');

    // Only becomes true after the person has attempted to submit.
    // Prevents "This field is required" from appearing just because
    // someone tabbed through fields without typing anything yet.
    let attemptedSubmit = false;

    function clearError(el) { const wrap=el?.closest('.form-field, .consent-card'); if (wrap) wrap.classList.remove('has-error'); const err=document.getElementById(el?.id+'Error'); if(err) err.textContent=''; }
    function setError(el, message) { const wrap=el.closest('.form-field, .consent-card'); if(wrap) wrap.classList.add('has-error'); const err=document.getElementById(el.id+'Error'); if(err) err.textContent=message; }

    function validateElement(el) {
      clearError(el);
      if (el.type==='checkbox' && el.required && !el.checked) { setError(el, 'Please accept this statement to continue.'); return false; }
      const value=(el.value||'').trim();
      if (el.required && !value) { setError(el, 'This field is required.'); return false; }
      if (el.type==='email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError(el, 'Please enter a valid email address.'); return false; }
      if (el.id==='dfWhatsapp' && value) { const d=value.replace(/\D/g,'').replace(/^91(?=\d{10}$)/,''); if(!/^[6-9]\d{9}$/.test(d)) { setError(el,'Please enter a valid 10-digit Indian mobile number.'); return false; } el.value=d; }
      return true;
    }

    function validateForm() {
      let ok=true;
      form.querySelectorAll('input[required]').forEach(el => { if(!validateElement(el)) ok=false; });
      if(!ok) { statusEl.textContent='Please complete the highlighted fields.'; statusEl.className='discovery-form-status is-error'; const first=form.querySelector('.has-error input'); first?.focus(); }
      else { statusEl.textContent=''; statusEl.className='discovery-form-status'; }
      return ok;
    }

    form.querySelectorAll('.language-toggle').forEach(btn => btn.addEventListener('click', () => { const target=document.getElementById(btn.dataset.target); const open=btn.getAttribute('aria-expanded')==='true'; btn.setAttribute('aria-expanded', String(!open)); target.hidden=open; }));

    // Blur only validates once the person has typed something (so we can
    // catch format errors like a bad email) or after they've already
    // tried to submit once (so remaining empty fields get flagged).
    form.querySelectorAll('input').forEach(el=>{
      el.addEventListener('blur',()=>{ if(attemptedSubmit || (el.value||'').trim()) validateElement(el); });
      el.addEventListener('input',()=>clearError(el));
      el.addEventListener('change',()=>clearError(el));
    });

    const params=new URLSearchParams(location.search);
    const tracking={dfUtmSource:'utm_source',dfUtmMedium:'utm_medium',dfUtmCampaign:'utm_campaign',dfCampaign:'campaign'};
    Object.entries(tracking).forEach(([id,key])=>{document.getElementById(id).value=params.get(key)||''});
    document.getElementById('dfLandingPage').value=location.href;
    const generateLeadId=()=>`OW-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    document.getElementById('dfLeadId').value=generateLeadId();

    form.addEventListener('submit', async (event) => {
      attemptedSubmit = true;
      event.preventDefault();

      if (!validateForm()) return;

      const endpointConfigured = isConfiguredHttpUrl(
        OPSWALLAH_FORM_CONFIG.formEndpoint
      );

      const paymentConfigured = isConfiguredHttpUrl(
        OPSWALLAH_FORM_CONFIG.paymentUrl
      );

      if (!endpointConfigured) {
        statusEl.textContent =
          'Lead-storage endpoint is not configured yet. Paste the Google Apps Script /exec URL in discovery-form.js.';

        statusEl.className =
          'discovery-form-status is-error';

        return;
      }

      document.getElementById('dfSubmittedAt').value =
        new Date().toISOString();

      const formData = new FormData(form);

      const payload =
        Object.fromEntries(formData.entries());

      /*
       * Google Apps Script reads these values through e.parameter.
       *
       * URLSearchParams avoids the browser preflight request that can
       * happen when application/json is posted to Apps Script.
       */
      const requestBody = new URLSearchParams();

      Object.entries(payload).forEach(([key, value]) => {
        requestBody.append(
          key,
          Array.isArray(value)
            ? value.join(', ')
            : String(value ?? '')
        );
      });

      // Prevent duplicate submissions from repeated clicks/taps.
      submitBtn.disabled = true;

      submitBtn.textContent =
        'Submitting your details…';

      statusEl.textContent =
        'Saving your details securely…';

      statusEl.className =
        'discovery-form-status is-info';

      try {
        const response = await fetch(
          OPSWALLAH_FORM_CONFIG.formEndpoint.trim(),
          {
            method: 'POST',
            body: requestBody
          }
        );

        if (!response.ok) {
          throw new Error(
            `Submission failed with status ${response.status}.`
          );
        }

        const responseText =
          await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            'The lead receiver returned an invalid response.'
          );
        }

        if (!result.success) {
          throw new Error(
            result.message ||
            'Lead could not be saved.'
          );
        }

        const confirmedLeadId =
          result.leadId ||
          payload.leadId ||
          '';

        sessionStorage.setItem(
          'opswallahLead',
          JSON.stringify({
            leadId: confirmedLeadId,
            name: payload.fullName || '',
            email: payload.email || '',
            phone: payload.whatsappNumber || '',
            amount: '29'
          })
        );

        form.hidden = true;
        successState.hidden = false;

        document
          .getElementById('successFirstName')
          .textContent =
            (payload.fullName || 'there')
              .trim()
              .split(/\s+/)[0];

        if (paymentConfigured) {
          paymentBtn.href =
            OPSWALLAH_FORM_CONFIG.paymentUrl.trim();

          paymentBtn.removeAttribute(
            'aria-disabled'
          );
        } else {
          paymentBtn.href = '#';

          paymentBtn.setAttribute(
            'aria-disabled',
            'true'
          );

          paymentBtn.addEventListener(
            'click',
            (clickEvent) => {
              clickEvent.preventDefault();

              statusEl.textContent =
                'Your details are saved, but the ₹29 payment link is not configured yet.';

              statusEl.className =
                'discovery-form-status is-error';
            }
          );
        }

        successState.focus();

        if (window.lucide) {
          lucide.createIcons();
        }
      } catch (error) {
        console.error(
          'OpsWallah lead submission error:',
          error
        );

        statusEl.textContent =
          'We could not save your details. Please try again or contact us on WhatsApp.';

        statusEl.className =
          'discovery-form-status is-error';

        submitBtn.disabled = false;

        submitBtn.innerHTML =
          'Submit Details & Continue <i data-lucide="arrow-right"></i>';

        if (window.lucide) {
          lucide.createIcons();
        }
      }
    });
  }
});
