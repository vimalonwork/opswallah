// OpsWallah payment result pages — V1 display layer.
// IMPORTANT: a browser redirect alone is not proof of payment.
// Verify payments in Razorpay Dashboard in V1;
// add webhook verification in V2.

const OPSWALLAH_PAYMENT_CONFIG = {
  paymentUrl: 'https://rzp.io/rzp/opswallah-discovery-session',
  whatsappNumber: '919625963612'
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

  const data = {
    firstName: (
      value('name', 'customer_name') ||
      stored.name ||
      'Learner'
    )
      .trim()
      .split(/\s+/)[0],

    amount:
      value('amount') ||
      stored.amount ||
      '29',

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
      'Failed / Cancelled'
  };

  Object.entries(data).forEach(([key, val]) => {
    document
      .querySelectorAll(`[data-field="${key}"]`)
      .forEach((element) => {
        element.textContent = val;
      });
  });

  const whatsappButton =
    document.getElementById('resultWhatsApp');

  if (whatsappButton) {
    const isSuccess =
      card.dataset.page === 'success';

    const message = isSuccess
      ? `Hi OpsWallah! 👋
I have completed the ₹29 booking for the Discovery Session.
Please guide me regarding the next step.

Name: ${stored.name || data.firstName}
Lead ID: ${data.leadId}
Payment ID: ${data.paymentId}`
      : `Hi OpsWallah,
I need help with my ₹29 Discovery Session payment.

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
      OPSWALLAH_PAYMENT_CONFIG.paymentUrl ||
      'index.html#discovery-form';
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