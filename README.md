# OpsWallah V1 release

## Configure before launch
1. In `script.js`, replace `REPLACE_WITH_FORM_ENDPOINT_URL` with the deployed Google Apps Script web-app URL.
2. In `script.js`, replace `REPLACE_WITH_29_RUPEE_PAYMENT_URL` with the Razorpay ₹29 Payment Link.
3. In `assets/js/payment-pages.js`, replace the same payment URL placeholder if needed.
4. Confirm WhatsApp number `919625963612` in both JS files.
5. Configure Razorpay success callback to `https://opswallah.in/payment-success.html`. Failure/cancel redirect support depends on the Razorpay product; otherwise share `https://opswallah.in/payment-failed.html` as the recovery page.
6. Deploy all files preserving the folder structure.

## Important V1 note
The payment result pages display available redirect/session data. Verify payment in Razorpay Dashboard before treating the success URL as final proof.
