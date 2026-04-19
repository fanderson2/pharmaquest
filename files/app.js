/* ============================================
   PHARMAQUEST — app.js
   ============================================ */

'use strict';

/* ---------- Config ---------- */
const CONFIG = {
  signupUrl: '/signup',       // Replace with your actual signup URL
  signinUrl: '/signin',       // Replace with your actual signin URL
  proUrl: '/signup?plan=pro', // Replace with your checkout URL
  eliteUrl: '/signup?plan=elite',
  foundingMemberCount: 200,
};

/* ---------- DOM References ---------- */
const urgencyBanner  = document.getElementById('urgencyBanner');
const urgencyClose   = document.getElementById('urgencyClose');
const mainNav        = document.getElementById('mainNav');
const hamburger      = document.getElementById('hamburger');
const navLinks       = document.getElementById('navLinks');
const modalOverlay   = document.getElementById('modalOverlay');
const modalClose     = document.getElementById('modalClose');
const modalTitle     = document.getElementById('modalTitle');
const modalSub       = document.getElementById('modalSub');
const modalCta       = document.getElementById('modalCta');
const modalEmail     = document.getElementById('modalEmail');

/* ---------- Urgency Banner ---------- */
urgencyClose.addEventListener('click', () => {
  urgencyBanner.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
  urgencyBanner.style.overflow   = 'hidden';
  urgencyBanner.style.maxHeight  = urgencyBanner.offsetHeight + 'px';
  requestAnimationFrame(() => {
    urgencyBanner.style.maxHeight = '0';
    urgencyBanner.style.opacity   = '0';
  });
  setTimeout(() => urgencyBanner.remove(), 320);
  sessionStorage.setItem('pq_banner_closed', '1');
});

// Restore closed state across page load
if (sessionStorage.getItem('pq_banner_closed')) {
  urgencyBanner && urgencyBanner.remove();
}

/* ---------- Sticky Nav Shadow ---------- */
window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ---------- Mobile Hamburger ---------- */
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  // Animate bars
  const bars = hamburger.querySelectorAll('span');
  if (open) {
    bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    bars[1].style.opacity   = '0';
    bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  });
});

/* ---------- Scroll-Reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.pain-card, .feat-card, .price-card, .proof-card, .trust-item, .built-inner'
).forEach((el, i) => {
  el.classList.add('scroll-reveal');
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  revealObserver.observe(el);
});

/* ---------- Modal ---------- */
let currentModalMode = 'free'; // 'free' | 'pro' | 'elite'

function openModal(mode = 'free') {
  currentModalMode = mode;
  const titles = {
    free:  'Start Free Today',
    pro:   'Get PharmaQuest Pro',
    elite: 'Go Elite — Serious Candidates Only',
  };
  const subs = {
    free:  'No credit card needed. Cancel anytime.',
    pro:   'Join Pro for £9.99/mo. Cancel anytime.',
    elite: 'Unlock everything for £24.99/mo.',
  };
  const ctas = {
    free:  'Get Started Free',
    pro:   'Start Pro — £9.99/mo',
    elite: 'Start Elite — £24.99/mo',
  };

  modalTitle.textContent = titles[mode];
  modalSub.textContent   = subs[mode];
  modalCta.textContent   = ctas[mode];
  modalEmail.value       = '';
  modalEmail.style.display = 'block';
  modalCta.style.display   = 'block';

  // Restore form if previously showing success
  const existing = modalOverlay.querySelector('.modal-success');
  if (existing) existing.remove();
  document.querySelector('.modal-form').style.display = 'flex';
  document.querySelector('.modal-note').style.display = 'block';

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modalEmail.focus(), 300);
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ---------- Form Submission ---------- */
function handleModalSubmit() {
  const email = modalEmail.value.trim();

  if (!validateEmail(email)) {
    shakeInput(modalEmail);
    return;
  }

  // Show loading state
  modalCta.textContent = 'Joining…';
  modalCta.disabled = true;

  // Simulate API call — replace with your real endpoint
  setTimeout(() => {
    showModalSuccess(email);
    trackSignup(email, currentModalMode);
  }, 900);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeInput(el) {
  el.style.borderColor = '#e24b4a';
  el.style.animation = 'none';
  requestAnimationFrame(() => {
    el.style.animation = 'shake 0.35s ease';
  });
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 1200);
}

function showModalSuccess(email) {
  document.querySelector('.modal-form').style.display = 'none';
  document.querySelector('.modal-note').style.display = 'none';

  const successEl = document.createElement('div');
  successEl.className = 'modal-success';
  successEl.innerHTML = `
    <div class="success-icon">✓</div>
    <h3>You're in!</h3>
    <p>We've sent a confirmation to <strong>${escapeHtml(email)}</strong>.<br>Check your inbox to get started.</p>
  `;
  modalOverlay.querySelector('.modal').appendChild(successEl);

  setTimeout(closeModal, 3200);
}

/* ---------- CTA Handlers ---------- */
function handleTryFree()  { openModal('free');  }
function handleGetPro()   { openModal('pro');   }
function handleGetElite() { openModal('elite'); }
function handleSignIn()   { window.location.href = CONFIG.signinUrl; }

function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Analytics / Tracking ---------- */
function trackSignup(email, plan) {
  // Replace with your analytics (e.g. GA4, Mixpanel, Segment)
  console.info('[PharmaQuest] Signup:', { email, plan });

  // Example: Google Analytics 4
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', 'sign_up', { method: plan });
  // }
}

/* ---------- Shake Animation ---------- */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ---------- Countdown Timer (Urgency) ---------- */
// Optional: add a countdown to reinforce scarcity
// Set your actual launch/deadline date here:
const DEADLINE = new Date('2025-07-01T00:00:00');

function updateCountdown() {
  const banner = document.getElementById('urgencyBanner');
  if (!banner) return;

  const now  = new Date();
  const diff = DEADLINE - now;
  if (diff <= 0) return;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);

  // Only show if less than 7 days remain — adds extra urgency
  if (d < 7) {
    const timerSpan = document.createElement('span');
    timerSpan.id = 'countdown';
    timerSpan.style.cssText = `
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      padding: 1px 7px;
      font-weight: 700;
      margin-left: 8px;
    `;
    timerSpan.textContent = `${d}d ${h}h ${m}m left`;

    const existing = document.getElementById('countdown');
    if (existing) {
      existing.textContent = timerSpan.textContent;
    } else {
      const text = banner.querySelector('.urgency-text');
      if (text) text.appendChild(timerSpan);
    }
  }
}

updateCountdown();
setInterval(updateCountdown, 60000);

/* ---------- Utility ---------- */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}

/* ---------- Init ---------- */
console.info('%cPharmaQuest v1.0 — Built by pharmacists, for pharmacists.', 'color:#0e9e7a;font-weight:bold;font-size:13px;');
