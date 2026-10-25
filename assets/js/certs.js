/* Certifications grid.
   - Certificates show the ISSUER LOGO only (no certificate preview).
   - Badges show the real badge image; clicking opens it in a popup modal
     (stays on the page — nothing else moves). */
(function () {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;

  const LOGO = {
    aws: 'assets/img/logo-aws.svg',
    anthropic: 'assets/img/logo-anthropic.svg',
    google: 'assets/img/logo-google.svg',
    tensorflow: 'assets/img/logo-tensorflow.svg',
    ielts: 'assets/img/logo-ielts.svg'
  };

  // type: 'cert' -> show issuer logo only
  //       'badge' -> show badge image, click = popup modal
  const CERTS = [
    { type: 'cert',  title: 'AWS Certified ML Engineer', issuer: 'Associate · Amazon Web Services', logo: LOGO.aws },
    { type: 'cert',  title: 'AWS Partner — Generative AI on AWS', issuer: 'Amazon Web Services', logo: LOGO.aws },
    { type: 'cert',  title: 'TensorFlow Developer', issuer: 'TensorFlow Certificate', logo: LOGO.tensorflow },
    { type: 'cert',  title: 'Claude with Amazon Bedrock', issuer: 'Anthropic × AWS', logo: LOGO.anthropic },
    { type: 'cert',  title: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', logo: LOGO.anthropic },
    { type: 'cert',  title: 'AI Fluency for Builders', issuer: 'CodePath × Anthropic', logo: LOGO.anthropic },
    { type: 'cert',  title: 'AI Capabilities and Limitations', issuer: 'Anthropic', logo: LOGO.anthropic },
    { type: 'cert',  title: 'Introduction to Agent Skills', issuer: 'Anthropic', logo: LOGO.anthropic },
    { type: 'cert',  title: 'Introduction to Subagents', issuer: 'Anthropic', logo: LOGO.anthropic },
    { type: 'cert',  title: 'Introduction to Claude Cowork', issuer: 'Anthropic', logo: LOGO.anthropic },
    { type: 'cert',  title: 'GenAI for Developers', issuer: 'Google Cloud', logo: LOGO.google },
    { type: 'cert',  title: 'IELTS 7.5', issuer: 'Overall Band Score', logo: LOGO.ielts },

    // Badges — real badge image + popup on click
    { type: 'badge', title: 'Claude Partner Badge — Claude Code', issuer: 'Anthropic', img: 'assets/img/certs/claude-partner-badge.webp' },
    { type: 'badge', title: 'AWS Partner: Generative AI Technical', issuer: 'Amazon Web Services · Training Badge', img: 'assets/img/certs/aws-genai-technical.webp' },
    { type: 'badge', title: 'AWS Knowledge: AI-Driven Development Lifecycle', issuer: 'Amazon Web Services · Training Badge', img: 'assets/img/certs/aws-ai-dlc.webp' }
  ];

  const frag = document.createDocumentFragment();
  CERTS.forEach((c) => {
    const el = document.createElement('div');
    el.className = 'cert-card reveal' + (c.type === 'badge' ? ' cert-card--badge' : '');
    const media = c.type === 'badge'
      ? `<span class="cert-card__badge"><img src="${c.img}" alt="${c.title} badge" loading="lazy" /></span>`
      : `<span class="cert-card__logo"><img src="${c.logo}" alt="${c.issuer} logo" loading="lazy" /></span>`;
    el.innerHTML = `<div class="cert-card__shine"></div>${media}<h3>${c.title}</h3><p>${c.issuer}</p>${c.type === 'badge' ? '<span class="cert-card__view">Click to view ↗</span>' : ''}`;
    if (c.type === 'badge') {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => openBadge(c));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBadge(c); } });
    }
    frag.appendChild(el);
  });
  grid.appendChild(frag);

  // --- Badge popup modal -------------------------------------------------
  const overlay = document.createElement('div');
  overlay.className = 'badge-modal';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<div class="badge-modal__card" role="dialog" aria-modal="true" aria-label="Certificate badge">' +
    '<button class="badge-modal__close" aria-label="Close">✕</button>' +
    '<img class="badge-modal__img" src="" alt="" />' +
    '<h3 class="badge-modal__title"></h3>' +
    '<p class="badge-modal__issuer"></p>' +
    '</div>';
  document.body.appendChild(overlay);
  const mImg = overlay.querySelector('.badge-modal__img');
  const mTitle = overlay.querySelector('.badge-modal__title');
  const mIssuer = overlay.querySelector('.badge-modal__issuer');
  const mClose = overlay.querySelector('.badge-modal__close');

  function openBadge(c) {
    mImg.src = c.img; mImg.alt = c.title + ' badge';
    mTitle.textContent = c.title; mIssuer.textContent = c.issuer;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeBadge() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  mClose.addEventListener('click', closeBadge);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBadge(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeBadge(); });

  // Reveal the new cards
  const cards = grid.querySelectorAll('.reveal');
  if (window.__kappyReveal) {
    window.__kappyReveal(cards);
  } else {
    setTimeout(() => {
      if (window.__kappyReveal) window.__kappyReveal(cards);
      else cards.forEach(c => c.classList.add('in'));
    }, 300);
  }
})();
