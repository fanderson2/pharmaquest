import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToFeatures = () =>
    document.getElementById('lp-features')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div>
      {/* URGENCY BANNER */}
      {bannerVisible && (
        <div className="urgency-banner">
          <span className="urgency-text">
            Founding member offer — first <strong>200 users</strong> get lifetime Pro for{' '}
            <strong>£99</strong> one-time. Don't miss it.
          </span>
          <button
            className="urgency-close"
            aria-label="Close banner"
            onClick={() => setBannerVisible(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <div className="logo-icon">+</div>
            PharmaQuest
          </a>
          <div className={`nav-links${menuOpen ? ' open' : ''}`}>
            <a href="#lp-features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#lp-pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#lp-about" onClick={() => setMenuOpen(false)}>About</a>
            <button className="btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn-primary" onClick={() => navigate('/signup')}>Try Free</button>
          </div>
          <button
            className="nav-hamburger"
            aria-label="Open menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="lp-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="badge fade-in">
              <span className="badge-dot" />
              Built by a GPhC-registered pharmacist
            </div>
            <h1 className="hero-h1 fade-in delay-1">
              Walk into your GPhC exam{' '}
              <span className="accent">knowing you will pass.</span>
            </h1>
            <p className="hero-sub fade-in delay-2">
              The UK's gamified clinical reasoning platform for pre-reg trainees — built by a
              registered Pharmacist.
            </p>
            <div className="hero-ctas fade-in delay-3">
              <button className="btn-hero" onClick={() => navigate('/signup')}>
                Start Free — No Card Needed
              </button>
              <button className="btn-hero-ghost" onClick={scrollToFeatures}>
                See How It Works
              </button>
            </div>
            <p className="hero-note fade-in delay-4">Free tier always available · One-time payment, no subscription</p>
          </div>

          <div className="hero-right fade-in delay-2">
            <div className="hero-reviews">
              <div className="hero-rating">
                <div className="stars">★★★★★</div>
                <span className="rating-text">Loved by trainees across the UK</span>
              </div>
              <div className="hero-review-card">
                <p>
                  "Finally a platform that prepares you for what the exam{' '}
                  <em>feels</em> like — not just what's in it."
                </p>
                <div className="reviewer-row">
                  <div className="reviewer-avatar">SK</div>
                  <div>
                    <div className="reviewer-name">Sara K.</div>
                    <div className="reviewer-meta">Pre-reg trainee, London</div>
                  </div>
                </div>
              </div>
              <div className="hero-review-card">
                <p>
                  "The exam readiness score showed me exactly where I was weak — I went from
                  52% to 71% in four weeks."
                </p>
                <div className="reviewer-row">
                  <div className="reviewer-avatar">MA</div>
                  <div>
                    <div className="reviewer-name">Mo A.</div>
                    <div className="reviewer-meta">Pre-reg trainee, Birmingham</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item"><span className="trust-dot" /> GPhC-aligned question bank</div>
          <div className="trust-item"><span className="trust-dot" /> Real clinical scenarios</div>
          <div className="trust-item"><span className="trust-dot" /> Gamified daily learning</div>
          <div className="trust-item"><span className="trust-dot" /> Built by a pharmacist</div>
        </div>
      </div>

      {/* PAIN SECTION */}
      <section className="pain scroll-reveal" id="lp-pain">
        <div className="section-inner">
          <p className="section-label">Sound familiar?</p>
          <h2 className="section-h2 light">
            Most trainees revise hard. Many still fail. Here's why...
          </h2>
          <div className="pain-grid">
            <div className="pain-card">
              <div className="pain-icon">📚</div>
              <p>"I read everything but couldn't apply it under pressure on exam day."</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon">😰</div>
              <p>"Question banks just test recall — not real clinical decision-making."</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon">📉</div>
              <p>"I don't know where my weak areas are until I've already failed."</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon">⏱️</div>
              <p>"I can't stay consistent — passive revision doesn't keep me engaged."</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features scroll-reveal" id="lp-features">
        <div className="section-inner">
          <p className="section-label">What makes PharmaQuest different</p>
          <h2 className="section-h2">Not just a question bank. A clinical thinking trainer.</h2>
          <p className="section-sub">
            Designed to build the habits, decisions, and confidence that pass exams — and save
            patients.
          </p>
          <div className="feat-grid">
            <div className="feat-card highlight">
              <div className="feat-icon">🎯</div>
              <h3>Clinical Scenario Engine</h3>
              <p>
                Real-world pressure decisions — not just recall. The same judgement calls you'll
                face on the exam and the shop floor.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🧠</div>
              <h3>Smart Practice Mode</h3>
              <p>
                Spaced repetition built in — questions you got wrong come back at the perfect
                moment. No AI needed, just proven memory science.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">📈</div>
              <h3>Exam Readiness Score</h3>
              <p>
                A single confidence score updated daily so you always know where you stand
                relative to pass threshold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing scroll-reveal" id="lp-pricing">
        <div className="section-inner">
          <p className="section-label">Pricing</p>
          <h2 className="section-h2">Start free. Upgrade when you're ready.</h2>
          <p className="section-sub">
            No credit card needed to get started. Upgrade when the free tier isn't enough.
          </p>
          <div className="price-grid two-col">
            {/* FREE */}
            <div className="price-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">£0</div>
              <div className="plan-desc">Always free. No card needed.</div>
              <ul className="plan-features">
                <li>One topic per section unlocked</li>
                <li>Full question explanations</li>
                <li>Score tracking</li>
                <li className="locked">Exam readiness score</li>
                <li className="locked">Smart practice mode</li>
                <li className="locked">Unlimited questions</li>
              </ul>
              <button className="price-btn outline" onClick={() => navigate('/signup')}>
                Start Free
              </button>
            </div>

            {/* PRO */}
            <div className="price-card featured">
              <div className="featured-badge">Lifetime access</div>
              <div className="plan-name">Pro</div>
              <div className="plan-price">£99</div>
              <div className="plan-desc">One-time payment. No subscription.</div>
              <ul className="plan-features">
                <li>Unlimited questions — all topics</li>
                <li>Exam readiness score</li>
                <li>Smart practice mode</li>
                <li>Full clinical scenarios</li>
                <li>Detailed progress analytics</li>
                <li>Priority support</li>
              </ul>
              <button className="price-btn solid" onClick={() => navigate('/signup?plan=pro')}>
                Get Pro — £99
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT BY */}
      <section className="built scroll-reveal" id="lp-about">
        <div className="section-inner built-inner">
          <div className="built-avatar">PQ</div>
          <div className="built-text">
            <h3>Built by a working pharmacist. Not a tech company.</h3>
            <p>
              PharmaQuest was created by a GPhC-registered pharmacist managing a high-volume
              pharmacy — someone who understands the real pressure of exams, clinical decisions,
              and what it takes to become a great pharmacist. This isn't theory. It's built from
              the shop floor up.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta scroll-reveal">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <h2 className="final-h2">
            Your exam is coming.<br />
            <span className="accent">Are you ready?</span>
          </h2>
          <p className="final-sub">
            Join hundreds of trainees already using PharmaQuest to prepare smarter, not harder.
          </p>
          <button className="btn-hero" onClick={() => navigate('/signup')}>
            Start Free Today
          </button>
          <p className="final-note">No credit card to start · £99 one-time · Free tier forever</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="nav-logo" style={{ marginBottom: 8 }}>
            <div className="logo-icon">+</div>
            PharmaQuest
          </div>
          <p className="footer-sub">The UK's #1 pharmacy exam preparation platform.</p>
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact</a>
          </div>
          <p className="footer-copy">© 2025 PharmaQuest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
