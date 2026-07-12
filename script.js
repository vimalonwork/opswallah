// ==========================================================================
// OpsWallah — Site Interactions
// ==========================================================================

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
        headline: 'Resume Bhej-Bhej Ke Thak Gaye?',
        sub: 'Reply na aane ki wajah degree nahi — readiness ki kami hai.',
        tier: 'tier-md',
        theme: 'theme-blue'
      },
      {
        headline: "'बस' Graduate Hoon?",
        sub: 'Feeling stuck because you are not an Engineer or MBA?',
        tier: 'tier-lg',
        theme: 'theme-purple'
      },
      {
        headline: 'Excel Aata Hai...<br>Interview Calls Nahi?',
        sub: 'Sirf tool janna kaafi nahi — industry samajh hi shortlist karwati hai.',
        tier: 'tier-sm',
        theme: 'theme-teal'
      },
      {
        headline: 'Engineer Ya MBA Nahi Ho?',
        sub: 'FinTech aur Banking companies ko Operations samajhne wale log chahiye — degree ka tag nahi.',
        tier: 'tier-md',
        theme: 'theme-amber'
      },
      {
        headline: 'Degree Complete.<br>Direction Missing?',
        sub: 'Sahi skill nahi — sahi direction ki kami hoti hai. Switch abhi bhi possible hai.',
        tier: 'tier-sm',
        theme: 'theme-coral'
      },
      {
        headline: 'Job Chahiye...<br>Industry Samajhte Ho?',
        sub: 'Banking & FinTech ka practical gyaan hi aapko baaki candidates se alag banata hai.',
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
      heroSub.textContent = slide.sub;

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

  // ---- "Inside Banking & FinTech" — premium floating keyword pills ----
  // No logos, no brand icons — every pill is plain text plus a small
  // accent dot. A fixed pool of pills lives permanently in the stage;
  // each pill runs its own independent fade loop (appear → stay → fade →
  // disappear → reappear elsewhere), so roughly 10-12 of the 15 are
  // visible at any moment without ever synchronizing or sliding around.
  const industryStage = document.getElementById('industryStage');

  if (industryStage) {
    const prefersReducedMotionStage = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Keyword-only vocabulary — Claude's selection from the Banking &
    // FinTech domain. Text pills only, nothing brand-specific.
    const INDUSTRY_KEYWORDS = [
      'KYC', 'UPI', 'BBPS', 'NACH', 'NPCI', 'RuPay', 'Visa',
      'Wallet', 'Excel', 'Power BI', 'RBI', 
	  'FinTech'
    ];

    // Reuses the same accent palette already used elsewhere on the site
    // (hero-hook themes) so pill color stays on-brand — no new colors.
    const DOT_COLORS = ['#2563EB', '#8B5CF6', '#14B8A6', '#F59E0B', '#FB923C', '#06B6D4', '#10B981'];

    const POOL_SIZE = 15; // within the 12-15 spec; ~10-12 visible on average
    const usedKeywords = new Set();

    // --- Non-overlapping slot grid ---
    // A loose 2-column x 8-row grid (16 slots) inside the stage. Pills
    // claim a free slot when they (re)appear and release it the moment
    // they finish fading out, so two visible pills can never land on top
    // of each other — the earlier free-random placement is what caused
    // pills to collide/overlap.
    const SLOT_COLS = 2;
    const SLOT_ROWS = 8;
    const TOTAL_SLOTS = SLOT_COLS * SLOT_ROWS;
    const cellW = 100 / SLOT_COLS;
    const cellH = 100 / SLOT_ROWS;
    const occupiedSlots = new Set();

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
      const jitterX = (Math.random() - 0.5) * 3; // small, stays within the 3% margin on each side of the 44%-wide pill
      const jitterY = (Math.random() - 0.5) * (cellH * 0.25);
      const left = col * cellW + (cellW - 44) / 2 + jitterX; // 44 matches .industry-chip width
      const top = row * cellH + cellH * 0.22 + jitterY;
      chip.style.left = Math.max(2, Math.min(98 - 44, left)) + '%';
      chip.style.top = Math.max(1, Math.min(97, top)) + '%';
    };

    const pickKeyword = (excludeLabel) => {
      const available = INDUSTRY_KEYWORDS.filter((k) => k !== excludeLabel && !usedKeywords.has(k));
      const pool = available.length ? available : INDUSTRY_KEYWORDS.filter((k) => k !== excludeLabel);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const randomDuration = () => (4.6 + Math.random() * 1).toFixed(2) + 's'; // 4.6–5.6s cycle
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
      // animation entirely, so the pool is simply shown as a calm static
      // set of keywords — content stays accessible, only the motion is removed.

      industryStage.appendChild(chip);
    };

    for (let i = 0; i < POOL_SIZE; i++) buildChip();
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

});
