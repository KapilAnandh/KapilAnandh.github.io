/* main.js — animations, interactions, command menu, case studies */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(max-width: 900px)').matches;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- Boot loader ---------- */
  (function boot() {
    const boot = $('#boot');
    const log = $('#bootLog');
    const bar = $('#bootBar');
    if (!boot) return;

    // Only show once per session
    if (sessionStorage.getItem('booted') || reduced) {
      boot.classList.add('done');
      setTimeout(() => boot.remove(), 50);
      startHero();
      return;
    }

    const lines = [
      '> initializing kapil.model …',
      '> loading weights: 2+ yrs production AI ✓',
      '> modules: LLMs · agents · RAG · MLOps ✓',
      '> status: ready. welcome 👋'
    ];
    let li = 0, ci = 0, out = '';
    function type() {
      if (li >= lines.length) { finish(); return; }
      const line = lines[li];
      if (ci <= line.length) {
        log.textContent = out + line.slice(0, ci);
        bar.style.width = Math.min(100, ((li + ci / line.length) / lines.length) * 100) + '%';
        ci++;
        setTimeout(type, 22);
      } else {
        out += line + '\n';
        li++; ci = 0;
        setTimeout(type, 180);
      }
    }
    function finish() {
      bar.style.width = '100%';
      sessionStorage.setItem('booted', '1');
      setTimeout(() => {
        boot.classList.add('done');
        setTimeout(() => boot.remove(), 650);
        startHero();
      }, 450);
    }
    type();
  })();

  /* ---------- Hero intro + typing role ---------- */
  function startHero() {
    const words = $$('#heroTitle .word');
    if (window.gsap && !reduced) {
      gsap.set(words, { yPercent: 115 });
      gsap.to(words, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.08, delay: 0.1 });
      gsap.fromTo('.hero__badge, .hero__role, .hero__desc, .hero__cta, .hero__socials',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
      gsap.fromTo('.portrait', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 });
      // Fail-safe: never leave letters hidden if a tween is interrupted.
      setTimeout(() => { gsap.set(words, { clearProps: 'transform' }); }, 2000);
    } else {
      words.forEach(w => (w.style.transform = 'none'));
    }
    typeRole();
  }

  function typeRole() {
    const el = $('#typeRole');
    if (!el) return;
    const roles = ['Generative AI systems', 'autonomous AI agents', 'RAG platforms', 'MLOps on AWS', 'fine-tuned LLMs'];
    let r = 0, c = 0, deleting = false;
    function tick() {
      const word = roles[r];
      el.textContent = word.slice(0, c);
      if (!deleting) {
        if (c < word.length) { c++; setTimeout(tick, 60); }
        else { deleting = true; setTimeout(tick, 1600); }
      } else {
        if (c > 0) { c--; setTimeout(tick, 30); }
        else { deleting = false; r = (r + 1) % roles.length; setTimeout(tick, 300); }
      }
    }
    tick();
  }

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  function scrollTo(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- GSAP ScrollTrigger setup ---------- */
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  function observeReveals(nodes) {
    Array.from(nodes).forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 0.04 + 's';
      io.observe(el);
    });
  }
  observeReveals($$('.reveal'));
  window.__kappyReveal = observeReveals;

  /* ---------- Word-by-word about text ---------- */
  (function aboutWords() {
    const el = $('[data-reveal-words]');
    if (!el) return;
    const txt = el.textContent.trim();
    el.innerHTML = txt.split(' ').map(w => `<span class="wrd">${w}</span>`).join(' ');
    const spans = $$('.wrd', el);
    if (window.gsap && window.ScrollTrigger && !reduced) {
      gsap.to(spans, {
        opacity: 1, ease: 'none', stagger: 0.03,
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: 0.6 }
      });
    } else {
      spans.forEach(s => (s.style.opacity = 1));
    }
  })();

  /* ---------- Counters ---------- */
  $$('.stat__num').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        o.unobserve(el);
        const dur = 1400; const t0 = performance.now();
        function step(now) {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ---------- Timeline progress line ---------- */
  (function timeline() {
    const line = $('#timelineProgress');
    const tl = $('#timeline');
    if (!line || !tl) return;
    if (window.gsap && window.ScrollTrigger && !reduced) {
      gsap.to(line, {
        height: '100%', ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 80%', scrub: 0.5 }
      });
    } else { line.style.height = '100%'; }
  })();

  /* ---------- Nav scroll state + active link ---------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  const navLinks = $$('.nav__links a');
  const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'certs', 'contact'].map(id => $('#' + id)).filter(Boolean);
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    let current = 'hero';
    sections.forEach(s => { if (y >= s.offsetTop - 160) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Smooth anchor clicks ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && $(id)) { e.preventDefault(); scrollTo(id); closeMobile(); }
    });
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');
  function closeMobile() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      mobileMenu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('#mobileMenu a').forEach(a => a.addEventListener('click', closeMobile));
  }

  /* ---------- Custom cursor ---------- */
  if (!isTouch) {
    const dot = $('#cursorDot'), ring = $('#cursorRing');
    let rx = 0, ry = 0, mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    }, { passive: true });
    (function ringLoop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    })();
    $$('a, button, .tilt, .magnetic, input, .chip-btn').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('grow'));
      el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && window.gsap) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' }));
    });
  }

  /* ---------- Portrait 3D tilt ---------- */
  (function portraitTilt() {
    const p = $('#portrait'); const frame = p && $('.portrait__frame', p);
    if (!p || !frame || isTouch) return;
    p.addEventListener('mousemove', (e) => {
      const r = p.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    p.addEventListener('mouseleave', () => { frame.style.transform = ''; });
  })();

  /* ---------- Project card glow + tilt ---------- */
  if (!isTouch) {
    $$('.proj-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        const rx = (y / r.height - 0.5) * -6;
        const ry = (x / r.width - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Project filters ---------- */
  (function filters() {
    const wrap = $('#projFilters');
    if (!wrap) return;
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      $$('.chip-btn', wrap).forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      $$('.proj-card').forEach(card => {
        const show = f === 'all' || (card.dataset.cats || '').includes(f);
        card.classList.toggle('is-hidden', !show);
      });
    });
  })();

  /* ---------- Case study panel ---------- */
  const CASES = {
    onecarev1: { era: 'OneCare V1 · 2026 · Initial phase completed', title: 'OneCare V1 — Clinical AI Integration',
      tags: ['MedGemma', 'Clinical AI', 'Appointment Agent', 'Prescription Agent', 'OCR Research'],
      problem: 'A clinical platform needed AI woven through the doctor workflow — from decision support and documentation to appointments and prescriptions — while keeping models hosted privately.',
      arch: ['Doctor–patient visit', 'Live note-taking', 'MedGemma (local)', 'Clinical agents', 'SOAP note + autofill'],
      role: 'Contributed to the AI integration of OneCare V1: clinical decision-support integrations, SOAP-note generation, and hosting MedGemma on a local server. Implemented appointment and prescription agents on locally hosted models, live note-taking for doctor–patient conversations, and autofill for clinical information capture. Researched 10+ OCR models and approaches, evaluated their suitability, and prepared a comparative report; also researched combining medical image understanding, OCR, clinical extraction and LLM workflows to identify new AI capabilities.',
      impact: 'Initial project phase completed · private MedGemma hosting · clinical agents + live documentation · 10+ OCR models evaluated with a recommendation report.' },
    onecarev2: { era: 'OneCare V2 · 2026 · In progress', title: 'OneCare V2 — AI Infrastructure & Integration',
      tags: ['Local Model Hosting', 'API Integration', 'Live Notes', 'Deployment'],
      problem: 'The next OneCare version needed a fresh local AI infrastructure and clean, key-based access so product features could consume models reliably.',
      arch: ['New local infra', 'Hosted model server', 'API-key access', 'Product integrations', 'Live note-taking'],
      role: 'Hosting AI models in a new local infrastructure setup, providing API-key-based integrations through the locally hosted model server, working on live note-taking capabilities, and supporting ongoing AI integration and deployment activities.',
      impact: 'Active development · private model infrastructure · secure key-based integrations powering product features.' },
    dfin: { era: 'DFIN · 2026 · OCR Support', title: 'DFIN — OCR Model Hosting',
      tags: ['Qwen', 'OCR', 'Local Hosting', 'Technical Support'],
      problem: 'The DFIN project needed reliable, locally hosted OCR to handle its document and data-processing requirements during testing.',
      arch: ['Documents', 'Qwen OCR (local)', 'Extraction workflow', 'Testing & validation'],
      role: 'Provided hosting and configured a Qwen model on the local server for OCR extraction to support the project\'s document and data-processing needs. Delivered the required local model hosting and technical support to test the OCR workflow.',
      impact: 'Locally hosted OCR enabling the DFIN document-processing workflow · hands-on hosting and testing support.' },
    okysoft: { era: 'Okysoft Cortex · 2026 · Platform Modernization', title: 'Okysoft Cortex — TTS Platform Modernization',
      tags: ['Text-to-Speech', 'SageMaker', 'Cloud Migration', 'Performance & Cost'],
      problem: 'An existing text-to-speech platform needed to move to a more scalable, cost-efficient cloud setup without losing reliability.',
      arch: ['Existing TTS platform', 'Cloud migration', 'Amazon SageMaker', 'Testing & validation'],
      role: 'Working as an AI/ML resource on the Okysoft Cortex modernization, contributing to migrating the existing Fish Speech text-to-speech platform to Amazon SageMaker. Supporting implementation, setup, integration, testing, troubleshooting, performance validation and cost analysis as part of the delivery.',
      impact: 'A more scalable, cost-aware TTS platform on AWS · end-to-end support from setup through performance and cost validation.' },
    sophia: { era: 'OneReach v2 · Sep 2026 – Present', title: 'Sophia — Autonomous AI Sales Agent',
      tags: ['Mastra', 'Temporal', 'NestJS', 'Next.js', 'RAG', 'SSE'],
      problem: 'Sales teams needed an AI agent that could reason over dozens of tools without blowing past LLM token limits, and keep long-running workflows reliable.',
      arch: ['User', 'AG-UI / SSE chat', 'Mastra agent', 'Semantic tool retrieval', 'Temporal workflows'],
      role: 'Built the agent on the Mastra framework with provider-agnostic LLMs (OpenAI, Anthropic, Gemini): 78 tools across 35 capabilities with semantic tool retrieval, streaming chat (CopilotKit/AG-UI, SSE) and multi-format document ingestion (PDF, DOCX, PPTX, OCR) with citation-backed RAG.',
      impact: '78 tools orchestrated within token limits · durable workflows on Temporal · full-stack delivery on NestJS, PostgreSQL and Next.js.' },
    perzona: { era: 'Perzona · Feb – Apr 2026', title: 'Agentic AI & NL2SQL Analytics',
      tags: ['Bedrock', 'Claude Sonnet 4.5', 'Lambda', 'CDK', 'DynamoDB'],
      problem: '40+ client tenants needed natural-language analytics over their data — safely, without exposing them to destructive or cross-tenant SQL.',
      arch: ['NL query', 'Bedrock (Claude)', 'SQL validator', 'DynamoDB', 'Audit log'],
      role: 'Architected a multi-tenant NL2SQL conversational analytics platform on Amazon Bedrock, Lambda, CDK and DynamoDB. Implemented three-layer security (Bedrock Guardrails + SELECT-only SQL validator) with CloudWatch monitoring and audit logging.',
      impact: 'Served 40+ client tenants · three-layer security · full audit trail and monitoring.' },
    stratagraph: { era: 'Stratagraph Energy · Mar – Jun 2026', title: '~8TB RAG & Log-Quality Grading',
      tags: ['Textract', 'Rekognition', 'Bedrock Claude', 'OpenSearch', 'Terraform'],
      problem: 'Mudlog reports needed near-real-time quality grading, and engineers needed trustworthy, citation-backed answers across a massive document corpus.',
      arch: ['Mudlog docs', 'Textract / Rekognition', 'Bedrock Claude grading', 'Titan embeddings', 'OpenSearch RAG'],
      role: 'Built an AI Log Quality Grading system with Amazon Textract, Rekognition and Bedrock Claude. Created an ~8TB data lake with Titan embeddings in OpenSearch Serverless powering a RAG assistant with citation-backed answers (Terraform IaC, CI/CD, ISO 27001).',
      impact: 'Near-real-time grading · ~8TB searchable data lake · citation-backed RAG answers.' },
    helpiere: { era: 'HelPiere · May – Jul 2026', title: 'Multi-Agent Digital Concierge',
      tags: ['LangGraph', 'Bedrock AgentCore', 'Expedia API', 'UberEats API', 'JWT'],
      problem: 'A WhatsApp concierge had to handle both travel and food requests in two languages, routing each to the right specialist agent.',
      arch: ['WhatsApp', 'Orchestrator', 'Accommodation agent', 'Food-delivery agent', 'External APIs'],
      role: 'Designed a multi-agent GenAI concierge using LangGraph on Amazon Bedrock AgentCore, with an orchestrator routing between accommodation and food-delivery agents; integrated Expedia and UberEats APIs behind a bilingual, JWT-secured REST API.',
      impact: 'Bilingual concierge over WhatsApp Business · secure multi-agent routing.' },
    blacksmith: { era: 'Blacksmith Research · Apr – Aug 2026', title: 'Fashion Trend Analytics',
      tags: ['Bedrock Nova Pro', 'Vision', 'S3', 'Glue', 'Athena'],
      problem: 'Analysts wanted to spot emerging fashion trends across many portals and query them in plain language.',
      arch: ['8 fashion portals', 'Nova Pro vision', 'S3 / Glue / Athena lake', 'Analytics agent'],
      role: 'Engineered an AI trend-detection pipeline using Amazon Bedrock (Nova Pro) vision models on catalog images from 8 fashion portals, stored in a data lake; built a conversational analytics agent for natural-language trend queries.',
      impact: 'Trends detected across 8 portals · conversational, natural-language analytics.' },
    abaton: { era: 'Abaton Horus · May – Jun 2026', title: 'SageMaker Forecasting Pipeline',
      tags: ['SageMaker', 'Step Functions', 'ARIMA', 'CDK', 'EventBridge'],
      problem: 'Forecasting needed to run on a schedule with no manual steps, and predictions had to be reliably persisted.',
      arch: ['Data extraction', 'SageMaker ARIMA', 'Step Functions', 'EventBridge', 'Prediction store'],
      role: 'Trained an ARIMA forecasting model on Amazon SageMaker with Step Functions (95% confidence-interval accuracy); automated the full ML lifecycle — data extraction, scheduled training/inference and prediction persistence — using AWS CDK and EventBridge.',
      impact: '95% CI accuracy · fully automated, scheduled ML lifecycle.' },
    onelingo: { era: 'OneLingo · Sep 2026 – Present · Live at onelingo.ai', title: 'OneLingo — Real-Time Translation Platform',
      tags: ['WebSockets', 'Node.js', 'PostgreSQL', 'STT', 'LLM'],
      link: 'https://onelingo.ai/', linkLabel: 'Visit onelingo.ai ↗',
      problem: 'A multi-tenant product needed live captions and translation with pluggable STT/LLM engines, access control and usage insight.',
      arch: ['Audio in', 'STT engine', 'LLM translate', 'WebSocket stream', 'Captions out'],
      role: 'Built this product end-to-end from scratch — a multi-tenant desktop and web platform streaming live captions and translation over WebSockets with selectable STT/LLM engines; Node.js/PostgreSQL backend with role-based access, audit logs and usage analytics.',
      impact: 'Live at onelingo.ai · multi-tenant captions + translation · role-based access, audit logs, analytics.' }
  };

  const panel = $('#casePanel');
  const panelBody = $('#casePanelBody');
  const panelOverlay = $('#panelOverlay');
  function openCase(key) {
    const c = CASES[key];
    if (!c) return;
    panelBody.innerHTML = `
      <span class="cp-era">${c.era}</span>
      <h2>${c.title}</h2>
      <div class="cp-tags">${c.tags.map(t => `<span>${t}</span>`).join('')}</div>
      ${c.link ? `<a class="cp-live" href="${c.link}" target="_blank" rel="noopener">${c.linkLabel || 'Visit site ↗'}</a>` : ''}
      <div class="cp-block"><h4>Problem</h4><p>${c.problem}</p></div>
      <div class="cp-block"><h4>Architecture</h4><div class="cp-flow">${c.arch.map((n, i) => `<span class="node">${n}</span>${i < c.arch.length - 1 ? '<span class="arrow">→</span>' : ''}`).join('')}</div></div>
      <div class="cp-block"><h4>My role</h4><p>${c.role}</p></div>
      <div class="cp-block"><h4>Impact</h4><p>${c.impact}</p></div>`;
    panel.classList.add('open'); panelOverlay.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  }
  function closeCase() {
    panel.classList.remove('open'); panelOverlay.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  $$('.proj-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      openCase(card.dataset.proj);
    });
  });
  $('#casePanelClose').addEventListener('click', closeCase);
  panelOverlay.addEventListener('click', closeCase);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCase(); });

  /* ---------- Copy email ---------- */
  const copyBtn = $('#copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      const label = $('#copyEmailText');
      const orig = label.textContent;
      try { await navigator.clipboard.writeText(email); label.textContent = '✓ Copied to clipboard!'; }
      catch { label.textContent = email; window.location.href = 'mailto:' + email; }
      setTimeout(() => (label.textContent = orig), 1800);
    });
  }

  /* ---------- Local time (IST) ---------- */
  (function clock() {
    const el = $('#localTime');
    if (!el) return;
    function upd() {
      const t = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
      el.textContent = 'Local time · ' + t + ' IST';
    }
    upd(); setInterval(upd, 30000);
  })();

  /* ---------- Command menu (Ctrl+K) ---------- */
  (function cmd() {
    const overlay = $('#cmdOverlay');
    const input = $('#cmdInput');
    const list = $('#cmdList');
    const openBtn = $('#openCmd');
    if (!overlay) return;
    const items = [
      { label: 'Go to About', hint: '01', action: () => scrollTo('#about') },
      { label: 'Go to Experience', hint: '02', action: () => scrollTo('#experience') },
      { label: 'Go to Projects', hint: '03', action: () => scrollTo('#projects') },
      { label: 'Go to Skills', hint: '04', action: () => scrollTo('#skills') },
      { label: 'Go to Credentials', hint: '05', action: () => scrollTo('#certs') },
      { label: 'Go to Contact', hint: '06', action: () => scrollTo('#contact') },
      { label: 'Copy email address', hint: '@', action: () => navigator.clipboard && navigator.clipboard.writeText('kapilanandh2k@gmail.com') },
      { label: 'Download resume (PDF)', hint: '↓', action: () => window.open('assets/Kapil_Anandh_Resume.pdf', '_blank') },
      { label: 'Open LinkedIn', hint: '↗', action: () => window.open('https://www.linkedin.com/in/kapilanandh3611/', '_blank') },
      { label: 'Open GitHub', hint: '↗', action: () => window.open('https://github.com/KapilAnandh', '_blank') },
      { label: 'Ask Kappy a question', hint: '🤖', action: () => window.openKappy && window.openKappy() }
    ];
    let active = 0, filtered = items.slice();
    function render() {
      list.innerHTML = filtered.map((it, i) =>
        `<li data-i="${i}" class="${i === active ? 'active' : ''}"><span>${it.label}</span><span class="k">${it.hint}</span></li>`).join('');
    }
    function open() { overlay.classList.add('open'); input.value = ''; filtered = items.slice(); active = 0; render(); if (lenis) lenis.stop(); setTimeout(() => input.focus(), 50); }
    function close() { overlay.classList.remove('open'); if (lenis) lenis.start(); }
    function run(i) { const it = filtered[i]; if (it) { close(); setTimeout(it.action, 120); } }

    openBtn && openBtn.addEventListener('click', open);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      filtered = items.filter(it => it.label.toLowerCase().includes(q));
      active = 0; render();
    });
    list.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) run(+li.dataset.i); });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('open') ? close() : open(); return; }
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(active); }
    });
  })();

  /* ---------- Refresh ScrollTrigger after load ---------- */
  window.addEventListener('load', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
