// ==========================================================================
// OpsWallah — Site Interactions
// ==========================================================================

// --------------------------------------------------------------------------
// CONFIGURATION
// 1) Replace formEndpoint with the live Google Apps Script Web App URL.
//    It must end with /exec.
// 2) Keep paymentUrl pointed to the live Razorpay ₹29 Payment Link.
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

  // ---- Lucide icons ----
  if (window.lucide) {
    lucide.createIcons();
  }

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Mobile menu toggle ----
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      hamburgerBtn.classList.toggle('is-open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      hamburgerBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    // Close mobile menu when a link is tapped
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        hamburgerBtn.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // ---- FAQ accordion ----
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other items (single-open accordion)
      accordionItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        other.querySelector('.accordion-panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // ---- Sticky header shadow on scroll ----
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 8
        ? '0 4px 16px rgba(15, 23, 42, 0.06)'
        : 'none';
    });
  }

  // ---- Rotating pain-point headline ----
  const heroHook = document.getElementById('heroHook');
  const heroRotator = document.getElementById('heroRotator');
  const heroHeadline = document.getElementById('heroHeadline');
  const heroSub = document.getElementById('heroSub');
  const rotatorDots = document.getElementById('rotatorDots');

  if (heroHook && heroRotator && heroHeadline && heroSub && rotatorDots) {
    // Each slide attacks a different psychological pain point (not the same
    // message reworded), pairs a font-size tier (keeps the box height frozen
    // — long/two-line hooks shrink instead of growing the box) with a theme
    // (subtle background tint + accent border color, 3–7% tint, rotates
    // every slide).
    const slides = [
      {
        headline: 'Resume Bhej-Bhej Ke <span class="hl-warm">Thak Gaye?</span>',
        sub: 'Reply na aane ki wajah degree nahi — <strong class="sub-emphasis">readiness ki kami</strong> hai.',
        tier: 'tier-md',
        theme: 'theme-blue'
      },
      {
        headline: '<span class="hl-warm">\'बस\' Graduate</span> Hoon?',
        sub: 'Feeling stuck because you are not an <strong class="sub-emphasis">Engineer or MBA</strong>?',
        tier: 'tier-lg',
        theme: 'theme-purple'
      },
      {
        headline: '<span class="hl-cool">Excel Aata Hai...</span><br>Interview Calls Nahi?',
        sub: 'Sirf tool jaanna kaafi nahi — <strong class="sub-emphasis">industry understanding</strong> profile ko stronger banati hai.',
        tier: 'tier-sm',
        theme: 'theme-teal'
      },
      {
        headline: '<span class="hl-warm">Engineer</span> Ya <span class="hl-cool">MBA</span> Nahi Ho?',
        sub: 'FinTech aur Banking companies ko <strong class="sub-emphasis">Operations samajhne wale log</strong> chahiye — sirf degree ka tag nahi.',
        tier: 'tier-md',
        theme: 'theme-amber'
      },
      {
        headline: 'Degree Complete.<br><span class="hl-warm">Direction Missing?</span>',
        sub: 'Problem hamesha skill ki nahi hoti — kabhi-kabhi <strong class="sub-emphasis">clear direction</strong> ki kami hoti hai.',
        tier: 'tier-sm',
        theme: 'theme-coral'
      },
      {
        headline: 'Job Chahiye...<br><span class="hl-cool">Industry Samajhte Ho?</span>',
        sub: 'Banking & FinTech ka <strong class="sub-emphasis">practical understanding</strong> aapko dusre candidates se alag dikhne mein madad karta hai.',
        tier: 'tier-sm',
        theme: 'theme-cyan'
      }
    ];

    const dots = Array.from(rotatorDots.querySelectorAll('.rotator-dot'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ROTATE_MS = 4500; // spec: every 4–5 seconds
    const FADE_MS = 600;    // spec: 500–700ms fade + slight upward rise

    let currentIndex = 0;
    let rotateTimer = null;
    let isPaused = false;

    const setActiveDot = (index) => {
      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });
    };

    const applySlide = (index) => {
      const slide = slides[index];

      heroHeadline.innerHTML = slide.headline; // safe: static, author-controlled content only
      heroSub.innerHTML = slide.sub; // safe: static, author-controlled content only

      heroHeadline.classList.remove('tier-lg', 'tier-md', 'tier-sm');
      heroHeadline.classList.add(slide.tier);

      heroHook.classList.remove('theme-blue', 'theme-purple', 'theme-teal', 'theme-amber', 'theme-coral', 'theme-cyan');
      heroHook.classList.add(slide.theme);

      setActiveDot(index);
    };

    const goToSlide = (index) => {
      if (index === currentIndex) return;
      heroRotator.classList.add('is-fading');
      window.setTimeout(() => {
        currentIndex = index;
        applySlide(currentIndex);
        heroRotator.classList.remove('is-fading');
      }, FADE_MS);
    };

    const advance = () => {
      goToSlide((currentIndex + 1) % slides.length);
    };

    const startAutoRotate = () => {
      if (prefersReducedMotion) return; // respect reduced motion: no auto-play
      stopAutoRotate();
      rotateTimer = window.setInterval(() => {
        if (!isPaused) advance();
      }, ROTATE_MS);
    };

    const stopAutoRotate = () => {
      if (rotateTimer) window.clearInterval(rotateTimer);
      rotateTimer = null;
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        goToSlide(Number(dot.dataset.index));
      });
    });

    // Pause on hover/focus so people can actually read a slide they care about
    [heroRotator, rotatorDots].forEach((el) => {
      el.addEventListener('mouseenter', () => { isPaused = true; });
      el.addEventListener('mouseleave', () => { isPaused = false; });
      el.addEventListener('focusin', () => { isPaused = true; });
      el.addEventListener('focusout', () => { isPaused = false; });
    });

    applySlide(0); // set initial tier/theme classes to match slide 0
    startAutoRotate();
  }

  // ---- "Inside Banking & FinTech" — compact rotating keyword pills ----
  // The full keyword vocabulary lives here in JS, but only a small "active
  // subset" is ever rendered inside the fixed-height stage: 6 pills max on
  // desktop, 3 max on mobile. Each visible pill fades in (~0.6-0.8s), holds
  // (~2-2.5s), fades out, then reappears at a different safe-zone slot with
  // a new keyword — so the stage height (and therefore the whole panel)
  // never grows, and no two visible pills can ever overlap.
  const industryStage = document.getElementById('industryStage');

  if (industryStage) {
    const prefersReducedMotionStage = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileQuery = window.matchMedia('(max-width: 700px)');

    // Full keyword vocabulary — Banking & FinTech domain. Text pills only,
    // nothing brand-specific. Exactly 15 topics, matching the "Explore 15+
    // Industry Topics" heading/CTA copy.
    const INDUSTRY_KEYWORDS = [
      'UPI', 'BBPS', 'KYC', 'AML', 'Cards', 'Visa', 'RuPay', 'NPCI', 'NACH',
      'Excel', 'Power BI', 
    ];

    // Reuses the same accent palette already used elsewhere on the site
    // (hero-hook themes) so pill color stays on-brand — no new colors.
    const DOT_COLORS = ['#2563EB', '#8B5CF6', '#14B8A6', '#F59E0B', '#FB923C', '#06B6D4', '#10B981'];

    let usedKeywords = new Set();
    let occupiedSlots = new Set();
    let SLOT_COLS, SLOT_ROWS, TOTAL_SLOTS, cellW, cellH, POOL_SIZE, chipWidthPct;
    let isMobile = mobileQuery.matches;

    // --- Responsive safe-zone grid ---
    // More slots than active pills, so a reappearing pill can land
    // somewhere different from where it faded out, while the active count
    // itself stays capped (8 desktop / 4 mobile) and never overlaps.
    const configureGrid = () => {
      if (isMobile) {
        SLOT_COLS = 2; SLOT_ROWS = 2; POOL_SIZE = 3; chipWidthPct = 46; // max 3 visible
      } else {
        SLOT_COLS = 2; SLOT_ROWS = 4; POOL_SIZE = 6; chipWidthPct = 44; // max 6 visible
      }
      TOTAL_SLOTS = SLOT_COLS * SLOT_ROWS;
      cellW = 100 / SLOT_COLS;
      cellH = 100 / SLOT_ROWS;
    };

    const claimSlot = () => {
      const free = [];
      for (let i = 0; i < TOTAL_SLOTS; i++) if (!occupiedSlots.has(i)) free.push(i);
      const pool = free.length ? free : Array.from({ length: TOTAL_SLOTS }, (_, i) => i);
      const slot = pool[Math.floor(Math.random() * pool.length)];
      occupiedSlots.add(slot);
      return slot;
    };

    const releaseSlot = (slot) => {
      if (slot !== undefined) occupiedSlots.delete(slot);
    };

    const positionAtSlot = (chip, slot) => {
      const col = slot % SLOT_COLS;
      const row = Math.floor(slot / SLOT_COLS);
      const jitterX = (Math.random() - 0.5) * 3;
      const jitterY = (Math.random() - 0.5) * (cellH * 0.2);
      const left = col * cellW + (cellW - chipWidthPct) / 2 + jitterX;
      const top = row * cellH + cellH * 0.18 + jitterY;
      chip.style.left = Math.max(2, Math.min(98 - chipWidthPct, left)) + '%';
      chip.style.top = Math.max(1, Math.min(96, top)) + '%';
    };

    const pickKeyword = (excludeLabel) => {
      const available = INDUSTRY_KEYWORDS.filter((k) => k !== excludeLabel && !usedKeywords.has(k));
      const pool = available.length ? available : INDUSTRY_KEYWORDS.filter((k) => k !== excludeLabel);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    // 3.4–4.2s full cycle; paired with the 18%/82% keyframe split in CSS
    // this gives a ~0.6-0.8s fade-in, ~2.2-2.7s visible hold, ~0.6-0.8s
    // fade-out — a rotation cadence of roughly every 2.5-3.5s per pill.
    const randomDuration = () => (3.4 + Math.random() * 0.8).toFixed(2) + 's';
    const randomDelay = (duration) => `-${(Math.random() * parseFloat(duration)).toFixed(2)}s`; // stagger start
    const randomDot = () => DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];

    const applyKeyword = (chip, dotEl, labelEl, label) => {
      const previous = chip.dataset.label;
      if (previous) usedKeywords.delete(previous);
      chip.dataset.label = label;
      usedKeywords.add(label);
      labelEl.textContent = label;
      dotEl.style.setProperty('--dot-color', randomDot());
    };

    const buildChip = () => {
      const chip = document.createElement('span');
      chip.className = 'industry-chip';

      const dot = document.createElement('span');
      dot.className = 'industry-chip-dot';

      const labelEl = document.createElement('span');
      labelEl.className = 'industry-chip-label';

      chip.appendChild(dot);
      chip.appendChild(labelEl);

      const label = pickKeyword(null);
      applyKeyword(chip, dot, labelEl, label);

      const slot = claimSlot();
      chip.dataset.slot = slot;
      positionAtSlot(chip, slot);

      if (!prefersReducedMotionStage) {
        const duration = randomDuration();
        chip.style.animationDuration = duration;
        chip.style.animationDelay = randomDelay(duration);

        // Fires once per loop, right as the pill is fully faded out — the
        // safe moment to free its old slot, claim a new one, and swap its
        // keyword before it fades back in, so it never overlaps a pill
        // that's still visible and the reappearance always looks fresh.
        chip.addEventListener('animationiteration', () => {
          releaseSlot(Number(chip.dataset.slot));
          const newSlot = claimSlot();
          chip.dataset.slot = newSlot;
          positionAtSlot(chip, newSlot);
          applyKeyword(chip, dot, labelEl, pickKeyword(chip.dataset.label));
        });
      }
      // When reduced motion is on, CSS forces opacity:1 and disables the
      // animation entirely, so the active subset is simply shown as a calm
      // static set of keywords — content stays accessible, motion removed.

      industryStage.appendChild(chip);
    };

    const buildStage = () => {
      industryStage.innerHTML = '';
      usedKeywords = new Set();
      occupiedSlots = new Set();
      configureGrid();
      for (let i = 0; i < POOL_SIZE; i++) buildChip();
    };

    buildStage();

    // Rebuild only when crossing the mobile/desktop breakpoint, so a pool
    // sized for 8 pills never lingers once the panel shrinks to mobile
    // (and vice versa).
    const handleBreakpointChange = (e) => {
      isMobile = e.matches;
      buildStage();
    };
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleBreakpointChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(handleBreakpointChange); // older Safari fallback
    }
  }

  // ---- Scroll reveal for sections ----
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: no IntersectionObserver support — just show everything
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // ---- About OpsWallah: expand/collapse ----
  const aboutToggleBtn = document.getElementById('aboutToggleBtn');
  const aboutExpand = document.getElementById('aboutExpand');

  if (aboutToggleBtn && aboutExpand) {
    const toggleText = aboutToggleBtn.querySelector('.about-toggle-text');

    const setExpandedHeight = () => {
      aboutExpand.style.maxHeight = aboutExpand.scrollHeight + 'px';
    };

    aboutToggleBtn.addEventListener('click', () => {
      const isOpen = aboutToggleBtn.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        // Collapse
        aboutExpand.style.maxHeight = '0px';
        aboutExpand.classList.remove('is-open');
        aboutToggleBtn.setAttribute('aria-expanded', 'false');
        aboutExpand.setAttribute('aria-hidden', 'true');
        if (toggleText) toggleText.textContent = 'Know More About OpsWallah';
      } else {
        // Expand
        aboutExpand.classList.add('is-open');
        aboutToggleBtn.setAttribute('aria-expanded', 'true');
        aboutExpand.setAttribute('aria-hidden', 'false');
        if (toggleText) toggleText.textContent = 'Show Less';
        setExpandedHeight();
      }
    });

    // Keep the open panel's max-height accurate if content reflows
    // (e.g. viewport resize changes line-wrapping and content height).
    window.addEventListener('resize', () => {
      if (aboutExpand.classList.contains('is-open')) setExpandedHeight();
    });
  }

  // ---- WhatsApp Quick Connect (floating button + QR popup) ----
  const waFloatBtn = document.getElementById('waFloatBtn');
  const waModalOverlay = document.getElementById('waModalOverlay');
  const waModal = document.getElementById('waModal');
  const waModalClose = document.getElementById('waModalClose');

  if (waFloatBtn && waModalOverlay && waModal && waModalClose) {
    const CLOSE_TRANSITION_MS = 320; // keep in sync with .wa-modal-overlay transition
    let lastFocusedEl = null;

    const getFocusableEls = () =>
      Array.from(waModal.querySelectorAll('a[href], button:not([disabled])'));

    const onWaKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWaModal();
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getFocusableEls();
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    function openWaModal() {
      lastFocusedEl = document.activeElement;

      waModalOverlay.hidden = false;
      document.documentElement.classList.add('wa-no-scroll');
      document.body.classList.add('wa-no-scroll');

      // Allow the browser to paint with hidden removed before animating in
      requestAnimationFrame(() => {
        waModalOverlay.classList.add('is-open');
      });

      waFloatBtn.setAttribute('aria-expanded', 'true');
      waModalClose.focus();
      document.addEventListener('keydown', onWaKeydown);
    }

    function closeWaModal() {
      waModalOverlay.classList.remove('is-open');
      waFloatBtn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onWaKeydown);

      window.setTimeout(() => {
        waModalOverlay.hidden = true;
        document.documentElement.classList.remove('wa-no-scroll');
        document.body.classList.remove('wa-no-scroll');
        if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
          lastFocusedEl.focus();
        }
      }, CLOSE_TRANSITION_MS);
    }

    waFloatBtn.addEventListener('click', openWaModal);
    waModalClose.addEventListener('click', closeWaModal);

    // Click outside the popup card closes it
    waModalOverlay.addEventListener('click', (event) => {
      if (event.target === waModalOverlay) closeWaModal();
    });
  }

  // ---- Booking CTAs: smooth scroll to Discovery Form ----
  const bookingCtas = document.querySelectorAll('.js-booking-cta');
  const discoveryCard = document.querySelector('.discovery-card');
  const discoveryFormSection = document.getElementById('discovery-form');
  let highlightTimer = null;
  bookingCtas.forEach((cta) => cta.addEventListener('click', (event) => {
    event.preventDefault();
    if (!discoveryFormSection) return;
    discoveryFormSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    if (discoveryCard) {
      clearTimeout(highlightTimer);
      discoveryCard.classList.add('is-highlighted');
      highlightTimer = setTimeout(() => discoveryCard.classList.remove('is-highlighted'), 1200);
    }
  }));

  // ---- Three-step Discovery Session form ----
  const form = document.getElementById('discoveryForm');
  if (form) {
    const steps = [...form.querySelectorAll('.form-step')];
    const nextBtn = document.getElementById('formNextBtn');
    const backBtn = document.getElementById('formBackBtn');
    const submitBtn = document.getElementById('discoverySubmitBtn');
    const statusEl = document.getElementById('discoveryFormStatus');
    const fill = document.getElementById('formProgressFill');
    const stepLabel = document.getElementById('formStepLabel');
    const stepName = document.getElementById('formStepName');
    const education = document.getElementById('dfEducationStatus');
    const stream = document.getElementById('dfStream');
    const source = document.getElementById('dfSource');
    const successState = document.getElementById('formSuccessState');
    const paymentBtn = document.getElementById('paymentContinueBtn');
    let currentStep = 0;

    const stepNames = ['Personal Details', 'Education & Career Profile', 'Program Interest & Consent'];
    const ids = (list) => list.map(id => document.getElementById(id)).filter(Boolean);
    const conditional = {
      current: document.getElementById('currentYearWrap'), expected: document.getElementById('expectedYearWrap'),
      graduation: document.getElementById('graduationYearWrap'), stream: document.getElementById('streamWrap'),
      otherStream: document.getElementById('otherStreamWrap')
    };
    const setRequired = (wrap, required) => { if (!wrap) return; wrap.hidden = !required; wrap.querySelectorAll('input,select').forEach(el => { el.required = required; if (!required) { el.value=''; clearError(el); } }); };
    function clearError(el) { const wrap=el?.closest('.form-field, .choice-group, .consent-card'); if (wrap) wrap.classList.remove('has-error'); const err=document.getElementById(el?.id+'Error'); if(err) err.textContent=''; }
    function setError(el, message) { const wrap=el.closest('.form-field, .choice-group, .consent-card'); if(wrap) wrap.classList.add('has-error'); const err=document.getElementById(el.id+'Error'); if(err) err.textContent=message; }
    function updateEducationFields() {
      const v=education.value;
      setRequired(conditional.current, v==='pursuing-graduation');
      setRequired(conditional.expected, v==='pursuing-graduation');
      setRequired(conditional.graduation, ['graduate','pursuing-postgraduation','postgraduate','doctorate'].includes(v));
      setRequired(conditional.stream, v!=='' && v!=='high-school');
      setRequired(conditional.otherStream, !conditional.stream.hidden && stream.value==='Other');
    }
    education.addEventListener('change', updateEducationFields);
    stream.addEventListener('change', updateEducationFields);
    source.addEventListener('change', () => setRequired(document.getElementById('otherSourceWrap'), source.value==='Other'));
    form.querySelectorAll('input[name="careerChallenge"]').forEach(r => r.addEventListener('change', () => setRequired(document.getElementById('otherChallengeWrap'), r.value==='Other' && r.checked)));
    form.querySelectorAll('input[name="programInterest"]').forEach(cb => cb.addEventListener('change', () => {
      const all=[...form.querySelectorAll('input[name="programInterest"]')];
      if (cb.dataset.exclusive==='true' && cb.checked) all.filter(x=>x!==cb).forEach(x=>x.checked=false);
      else if(cb.checked) all.filter(x=>x.dataset.exclusive==='true').forEach(x=>x.checked=false);
      document.getElementById('programInterestError').textContent='';
    }));
    form.querySelectorAll('.language-toggle').forEach(btn => btn.addEventListener('click', () => { const target=document.getElementById(btn.dataset.target); const open=btn.getAttribute('aria-expanded')==='true'; btn.setAttribute('aria-expanded', String(!open)); target.hidden=open; }));

    function validateElement(el) {
      clearError(el);
      if (el.hidden || el.closest('[hidden]')) return true;
      if (el.type==='checkbox' && el.required && !el.checked) { setError(el, 'Please accept this statement to continue.'); return false; }
      const value=(el.value||'').trim();
      if (el.required && !value) { setError(el, 'This field is required.'); return false; }
      if (el.type==='email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError(el, 'Please enter a valid email address.'); return false; }
      if (el.id==='dfWhatsapp' && value) { const d=value.replace(/\D/g,'').replace(/^91(?=\d{10}$)/,''); if(!/^[6-9]\d{9}$/.test(d)) { setError(el,'Please enter a valid 10-digit Indian mobile number.'); return false; } el.value=d; }
      return true;
    }
    function validateStep(index) {
      let ok=true;
      steps[index].querySelectorAll('input[required],select[required]').forEach(el => { if(!validateElement(el)) ok=false; });
      if(index===2) {
        if(!form.querySelector('input[name="programInterest"]:checked')) { document.getElementById('programInterestGroup').classList.add('has-error'); document.getElementById('programInterestError').textContent='Please select at least one program.'; ok=false; }
        if(!form.querySelector('input[name="careerChallenge"]:checked')) { document.getElementById('careerChallengeGroup').classList.add('has-error'); document.getElementById('careerChallengeError').textContent='Please select your biggest career challenge.'; ok=false; }
      }
      if(!ok) { statusEl.textContent='Please complete the highlighted fields.'; statusEl.className='discovery-form-status is-error'; const first=steps[index].querySelector('.has-error input, .has-error select'); first?.focus(); }
      else { statusEl.textContent=''; statusEl.className='discovery-form-status'; }
      return ok;
    }
    function showStep(index) {
      currentStep=index;
      steps.forEach((s,i)=>{s.hidden=i!==index;s.classList.toggle('is-active',i===index)});
      fill.style.width=((index+1)/steps.length*100)+'%'; stepLabel.textContent=`Step ${index+1} of ${steps.length}`; stepName.textContent=stepNames[index];
      backBtn.hidden=index===0; nextBtn.hidden=index===steps.length-1; submitBtn.hidden=index!==steps.length-1;
      steps[index].querySelector('input,select')?.focus({preventScroll:true});
    }
    nextBtn.addEventListener('click',()=>{ if(validateStep(currentStep)) showStep(currentStep+1); });
    backBtn.addEventListener('click',()=>showStep(Math.max(0,currentStep-1)));
    form.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('blur',()=>{ if(el.required) validateElement(el); }); el.addEventListener('input',()=>clearError(el)); el.addEventListener('change',()=>clearError(el)); });

    const params=new URLSearchParams(location.search);
    const tracking={dfUtmSource:'utm_source',dfUtmMedium:'utm_medium',dfUtmCampaign:'utm_campaign',dfCampaign:'campaign'};
    Object.entries(tracking).forEach(([id,key])=>{document.getElementById(id).value=params.get(key)||''});
    document.getElementById('dfLandingPage').value=location.href;
    const generateLeadId=()=>`OW-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    document.getElementById('dfLeadId').value=generateLeadId();

    form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateStep(2)) return;

  const endpointConfigured = isConfiguredHttpUrl(
    OPSWALLAH_FORM_CONFIG.formEndpoint
  );

  const paymentConfigured = isConfiguredHttpUrl(
    OPSWALLAH_FORM_CONFIG.paymentUrl
  );

  if (!endpointConfigured) {
    statusEl.textContent =
      'Lead-storage endpoint is not configured yet. Paste the Google Apps Script /exec URL in script.js.';

    statusEl.className =
      'discovery-form-status is-error';

    return;
  }

  document.getElementById('dfSubmittedAt').value =
    new Date().toISOString();

  const formData = new FormData(form);

  const payload =
    Object.fromEntries(formData.entries());

  payload.programInterest =
    formData.getAll('programInterest');

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

    updateEducationFields(); showStep(0);
  }

  // ---- Official Domain Verification popup ----
  const domainModalOverlay = document.getElementById('domainModalOverlay');
  const domainModal = document.getElementById('domainModal');
  const domainModalClose = document.getElementById('domainModalClose');
  const domainModalContinue = document.getElementById('domainModalContinue');
  const domainModalReopen = document.getElementById('domainModalReopen');
  if (domainModalOverlay && domainModal && domainModalClose && domainModalContinue) {
    const STORAGE_KEY='opswallah_domain_ack'; const RECHECK_MS=30*24*60*60*1000; const CLOSE_MS=320; let lastFocused=null;
    const shouldShow=()=>{try{const t=parseInt(localStorage.getItem(STORAGE_KEY),10);return !t||Date.now()-t>RECHECK_MS}catch{return true}};
    const focusables=()=>[...domainModal.querySelectorAll('a[href],button:not([disabled])')];
    const keydown=(e)=>{if(e.key==='Escape'){e.preventDefault();close()} if(e.key==='Tab'){const f=focusables();if(!f.length)return; if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus()}}};
    function open(){lastFocused=document.activeElement;domainModalOverlay.hidden=false;document.body.classList.add('domain-no-scroll');requestAnimationFrame(()=>domainModalOverlay.classList.add('is-open'));domainModalClose.focus();document.addEventListener('keydown',keydown)}
    function close(){try{localStorage.setItem(STORAGE_KEY,String(Date.now()))}catch{} domainModalOverlay.classList.remove('is-open');document.removeEventListener('keydown',keydown);setTimeout(()=>{domainModalOverlay.hidden=true;document.body.classList.remove('domain-no-scroll');lastFocused?.focus?.()},CLOSE_MS)}
    domainModalClose.addEventListener('click',close);domainModalContinue.addEventListener('click',close);domainModalOverlay.addEventListener('click',e=>{if(e.target===domainModalOverlay)close()});domainModalReopen?.addEventListener('click',open);
    if(shouldShow()) setTimeout(open,400);
  }
});
