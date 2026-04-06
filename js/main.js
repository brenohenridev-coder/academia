/**
 * TITAN FITNESS — Main UI Script
 * Design Chief · Premium Gym Website
 *
 * Handles:
 * - Navbar scroll state
 * - Mobile menu
 * - Scroll reveal (Intersection Observer)
 * - Animated counters
 * - Smooth anchor scroll
 * - Scroll-to-top button
 * - Hero text entrance animation
 */

(function () {
  'use strict';

  // ============================================================
  // NAVBAR — become opaque on scroll
  // ============================================================
  const navbar   = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTop');

  function onScroll() {
    const y = window.scrollY;

    // Navbar state
    if (navbar) navbar.classList.toggle('scrolled', y > 60);

    // Scroll-to-top visibility
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial state

  // ============================================================
  // MOBILE MENU
  // ============================================================
  const navToggle    = document.getElementById('navToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  const mobileOverlay= document.getElementById('mobileOverlay');
  const mobileClose  = document.getElementById('mobileClose');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navToggle)     navToggle.addEventListener('click', openMenu);
  if (mobileClose)   mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  // Close on nav link click
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', closeMenu)
  );

  // ============================================================
  // SMOOTH ANCHOR SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h') || '72', 10);
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ============================================================
  // SCROLL-TO-TOP BUTTON
  // ============================================================
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }

  // ============================================================
  // SCROLL REVEAL — Intersection Observer
  // ============================================================
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('visible'), delay);
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // ============================================================
  // ANIMATED COUNTERS
  // ============================================================
  function animateCounter(el, target, duration) {
    const start     = performance.now();
    const isDecimal = String(target).includes('.');

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value.toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('pt-BR');
    }

    requestAnimationFrame(tick);
  }

  const counterEls = document.querySelectorAll('.stat-big[data-target]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const delay  = parseInt(el.closest('.stat-card')?.dataset.delay || '0', 10);
        setTimeout(() => animateCounter(el, target, 1800), delay);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counterEls.forEach(el => counterObserver.observe(el));

  // ============================================================
  // HERO ENTRANCE ANIMATION
  // ============================================================
  const heroLines = document.querySelectorAll('.hero-title .hero-line');
  const heroBadge = document.querySelector('.hero-badge');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroCtas = document.querySelector('.hero-ctas');
  const heroStats = document.querySelector('.hero-stats');

  const heroItems = [heroBadge, ...heroLines, heroSubtitle, heroCtas, heroStats];
  heroItems.forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.7s ease ${i * 100 + 200}ms, transform 0.7s ease ${i * 100 + 200}ms`;
    // Remove reveal class to avoid double-animation
    el.classList.remove('reveal');
  });

  window.addEventListener('load', () => {
    heroItems.forEach(el => {
      if (!el) return;
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  // ============================================================
  // PARALLAX on about images
  // ============================================================
  const aboutMain = document.querySelector('.about-img-main img');
  const aboutSec  = document.querySelector('.about-img-secondary img');

  if (aboutMain || aboutSec) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (aboutMain) aboutMain.style.transform = `translateY(${y * 0.04}px)`;
      if (aboutSec)  aboutSec.style.transform  = `translateY(${-y * 0.03}px)`;
    }, { passive: true });
  }

  // ============================================================
  // GALLERY HOVER tilt effect
  // ============================================================
  document.querySelectorAll('.gal-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      item.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.01)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
      item.style.transition = 'transform 0.5s ease';
    });
    item.addEventListener('mouseenter', () => {
      item.style.transition = 'transform 0.1s ease';
    });
  });

  // ============================================================
  // PROGRAM CARDS — subtle 3D tilt
  // ============================================================
  document.querySelectorAll('.prog-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 0.4}deg) rotateY(${x * 0.4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ============================================================
  // TRAINER CARDS — spotlight effect
  // ============================================================
  document.querySelectorAll('.trainer-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(230,57,70,0.06) 0%, var(--card) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  // ============================================================
  // ACTIVE NAV LINK on scroll
  // ============================================================
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');
  const navHeight = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-h') || '72', 10);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${id}`;
          link.style.color = active ? '#fff' : '';
        });
      });
    },
    { threshold: 0.4, rootMargin: `-${navHeight}px 0px 0px 0px` }
  );

  sections.forEach(s => sectionObserver.observe(s));

})();
