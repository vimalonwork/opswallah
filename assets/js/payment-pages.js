// OpsWallah payment result pages — V1 display layer.
// IMPORTANT: a browser redirect alone is not proof of payment.
// Verify payments in Razorpay Dashboard in V1;
// add webhook verification in V2.

const OPSWALLAH_PAYMENT_CONFIG = {
  paymentUrl: 'https://rzp.io/rzp/opswallah-discovery-session',
  whatsappNumber: '919625963612'
};

// ---------------------------------------------------------------
// PRODUCT CATALOG — single source of truth for names & amounts.
// Keyed by the Payment Link's own ID (plink_...), NOT the rzp.io slug.
//
// To reprice: change nothing here — reprice in Razorpay Dashboard.
//   The amount below is the LIST price shown when status = "paid".
// To add a new product: add one new entry here. If a link isn't in
//   this catalog, pages fall back to a generic "Payment Received" view.
// ---------------------------------------------------------------
const PRODUCT_CATALOG = {
  plink_TCukVYTPz1WPkk: {
    name: 'OpsWallah Discovery Session (₹29 Confirmation Fee)',
    shortName: 'Discovery Session',
    amount: 29,
    partialAllowed: false,
    checkoutUrl: 'https://rzp.io/rzp/KQpqLlmB'
  },
  plink_TFbbPeLZEAHbki: {
    name: 'OpsWallah — Excel Mastery',
    shortName: 'Excel Mastery',
    amount: 2099,
    partialAllowed: false,
    checkoutUrl: 'https://rzp.io/rzp/iFgjasyr'
  },
  plink_TFbfTWBUSFvv2L: {
    name: 'OpsWallah — Excel + Banking/FinTech Ops',
    shortName: 'Excel + Banking/FinTech Ops',
    amount: 3499,
    partialAllowed: true,
    checkoutUrl: 'https://rzp.io/rzp/nSt02UB'
  }
};

const GENERIC_FALLBACK = {
  name: 'your OpsWallah course',
  shortName: 'your course',
  amount: null,
  partialAllowed: false,
  checkoutUrl: OPSWALLAH_PAYMENT_CONFIG.paymentUrl
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const card = document.querySelector('[data-page]');
  if (!card) return;

  const params = new URLSearchParams(location.search);

  let stored = {};

  try {
    stored = JSON.parse(
      sessionStorage.getItem('opswallahLead') || '{}'
    );
  } catch {
    stored = {};
  }

  const value = (...keys) =>
    keys
      .map((key) => params.get(key))
      .find(Boolean);

  // --- Identify the Payment Link and look it up in the catalog ---
  const paymentLinkId = value(
    'razorpay_payment_link_id',
    'payment_link_id'
  );

  const catalogEntry =
    (paymentLinkId && PRODUCT_CATALOG[paymentLinkId]) ||
    GENERIC_FALLBACK;

  const isKnownProduct = catalogEntry !== GENERIC_FALLBACK;

  // --- Payment status as reported by Razorpay's redirect ---
  const linkStatus = (
    value(
      'razorpay_payment_link_status',
      'status'
    ) || ''
  ).toLowerCase();

  const isPartiallyPaid = linkStatus === 'partially_paid';

  const data = {
    firstName: (
      value('name', 'customer_name') ||
      stored.name ||
      'Learner'
    )
      .trim()
      .split(/\s+/)[0],

    productName: catalogEntry.name,
    productShortName: catalogEntry.shortName,

    // Full payment → trust the catalog's fixed list price (URL never
    // carries a reliable amount). Partial payment → we do NOT know the
    // exact amount paid so far (Razorpay doesn't send it on redirect),
    // so we show plan-level messaging instead of a specific ₹ figure.
    amount:
      isKnownProduct && catalogEntry.amount !== null
        ? catalogEntry.amount
        : value('amount') || stored.amount || '29',

    paymentId:
      value(
        'razorpay_payment_id',
        'payment_id'
      ) ||
      'Available after Razorpay redirect',

    referenceId:
      value(
        'razorpay_payment_link_id',
        'razorpay_order_id',
        'reference_id',
        'order_id'
      ) ||
      'Available after Razorpay redirect',

    leadId:
      value('lead_id') ||
      stored.leadId ||
      '—',

    dateTime:
      new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),

    failureStatus:
      value(
        'status',
        'error_description'
      ) ||
      'Failed / Cancelled',

    statusLabel: isPartiallyPaid ? 'Partially Paid' : 'Successful'
  };

  Object.entries(data).forEach(([key, val]) => {
    document
      .querySelectorAll(`[data-field="${key}"]`)
      .forEach((element) => {
        element.textContent = val;
      });
  });

  // --- Partial payment messaging (success page only) ---
  const partialNote = document.querySelector('[data-partial-note]');
  const fullStatusRow = document.querySelector('[data-full-status-row]');
  const partialStatusRow = document.querySelector('[data-partial-status-row]');

  if (card.dataset.page === 'success') {
    if (isPartiallyPaid && catalogEntry.partialAllowed) {
      if (partialNote) {
        partialNote.hidden = false;
        partialNote.textContent =
          `We've received a partial payment towards ${catalogEntry.name} (₹${catalogEntry.amount}). ` +
          `The remaining balance will be requested separately by Razorpay. Our team will confirm the ` +
          `exact amount received and share your updated balance over WhatsApp within 24 hours.`;
      }
      if (fullStatusRow) fullStatusRow.hidden = true;
      if (partialStatusRow) partialStatusRow.hidden = false;
    } else {
      if (partialNote) partialNote.hidden = true;
      if (fullStatusRow) fullStatusRow.hidden = false;
      if (partialStatusRow) partialStatusRow.hidden = true;
    }
  }

  // --- Unknown / not-yet-catalogued product → generic fallback note ---
  const genericNote = document.querySelector('[data-generic-note]');
  if (genericNote) {
    genericNote.hidden = isKnownProduct;
  }

  const whatsappButton =
    document.getElementById('resultWhatsApp');

  if (whatsappButton) {
    const isSuccess =
      card.dataset.page === 'success';

    const message = isSuccess
      ? `Hi OpsWallah! 👋
I have completed the payment for ${data.productName}.

Name: ${stored.name || data.firstName}
Lead ID: ${data.leadId}
Amount: ₹${data.amount}${isPartiallyPaid ? ' (partial)' : ''}
Payment ID: ${data.paymentId}`
      : `Hi OpsWallah,
I need help with my payment for ${data.productName}.

Lead ID: ${data.leadId}
Reference ID: ${data.referenceId}`;

    whatsappButton.href =
      `https://wa.me/${OPSWALLAH_PAYMENT_CONFIG.whatsappNumber}` +
      `?text=${encodeURIComponent(message)}`;

    whatsappButton.target = '_blank';
    whatsappButton.rel = 'noopener';
  }

  const retryButton =
    document.getElementById('retryPayment');

  if (retryButton) {
    retryButton.href =
      catalogEntry.checkoutUrl ||
      OPSWALLAH_PAYMENT_CONFIG.paymentUrl ||
      'discovery_form.html';
  }

  const downloadButton =
    document.getElementById('downloadSummary');

  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const originalTitle = document.title;

      document.title =
        `OpsWallah-Payment-Summary-${data.leadId}`;

      window.print();

      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    });
  }
});
