/* Kappy — the cute chatbot interface */
(function () {
  const KB = window.KAPPY_KB;
  if (!KB) return;

  const launcher = document.getElementById('kappyLauncher');
  const badge = document.getElementById('kappyBadge');
  const bubble = document.getElementById('kappyBubble');
  const windowEl = document.getElementById('kappyWindow');
  const closeBtn = document.getElementById('kappyClose');
  const messages = document.getElementById('kappyMessages');
  const chips = document.getElementById('kappyChips');
  const form = document.getElementById('kappyForm');
  const text = document.getElementById('kappyText');
  const bot = launcher.querySelector('.kappy__bot');

  let opened = false, welcomed = false;

  // Eyes follow cursor (idle mascot)
  const eyeL = launcher.querySelector('.kappy__eye--l');
  const eyeR = launcher.querySelector('.kappy__eye--r');
  if (eyeL && eyeR && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', (e) => {
      const r = launcher.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dx = Math.cos(ang) * 1.3, dy = Math.sin(ang) * 1.3;
      eyeL.setAttribute('transform', `translate(${dx},${dy})`);
      eyeR.setAttribute('transform', `translate(${dx},${dy})`);
    }, { passive: true });
  }

  // Greeting bubble after a short delay
  setTimeout(() => { if (!opened) bubble.classList.add('show'); }, 3500);
  setTimeout(() => { if (!opened) bubble.classList.remove('show'); }, 9000);

  // Each mode gets its own thread container so switching tabs never mixes
  // or carries over the other conversation.
  const threadKapil = document.createElement('div');
  threadKapil.className = 'kappy__thread';
  const threadVerse = document.createElement('div');
  threadVerse.className = 'kappy__thread';
  threadVerse.style.display = 'none';
  messages.appendChild(threadKapil);
  messages.appendChild(threadVerse);

  function activeThread() { return mode === 'verse' ? threadVerse : threadKapil; }

  function addMsg(html, who) {
    const thread = activeThread();
    const el = document.createElement('div');
    el.className = 'kmsg kmsg--' + who;
    el.innerHTML = html;
    thread.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function typing() {
    const thread = activeThread();
    const t = document.createElement('div');
    t.className = 'ktyping';
    t.innerHTML = '<span></span><span></span><span></span>';
    thread.appendChild(t);
    messages.scrollTop = messages.scrollHeight;
    return t;
  }

  // Reveal a pre-built HTML reply word-by-word (used for built-in answers,
  // whose HTML we author ourselves and therefore trust). Parses to a DOM tree
  // first so tags/links stay intact while text streams in.
  function streamHTML(el, html, done) {
    const source = document.createElement('div');
    source.innerHTML = html;
    const steps = [];
    (function clone(src, dest) {
      src.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const target = document.createTextNode('');
          dest.appendChild(target);
          node.textContent.split(/(\s+)/).filter(Boolean).forEach((w) => steps.push({ target, word: w }));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el2 = node.cloneNode(false);
          dest.appendChild(el2);
          clone(node, el2);
        }
      });
    })(source, el);
    let i = 0;
    (function step() {
      if (i >= steps.length) { messages.scrollTop = messages.scrollHeight; done && done(); return; }
      const s = steps[i++];
      s.target.textContent += s.word;
      messages.scrollTop = messages.scrollHeight;
      setTimeout(step, 18);
    })();
  }

  // Escape untrusted text, then turn bare URLs / emails into safe links.
  function escapeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function linkify(text) {
    let s = escapeHTML(text);
    s = s.replace(/\b(https?:\/\/[^\s<)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g, '<a href="mailto:$1">$1</a>');
    return s.replace(/\n/g, '<br>');
  }

  // Stream plain text (from the AI) word-by-word into one text node, then
  // linkify at the end so URLs/emails become clickable.
  function streamText(el, text, done) {
    const words = text.split(/(\s+)/).filter(Boolean);
    const span = document.createElement('span');
    el.appendChild(span);
    let i = 0, acc = '';
    (function step() {
      if (i >= words.length) { el.innerHTML = linkify(acc); messages.scrollTop = messages.scrollHeight; done && done(); return; }
      acc += words[i++];
      span.textContent = acc;
      messages.scrollTop = messages.scrollHeight;
      setTimeout(step, 16);
    })();
  }

  // --- Groq integration ---------------------------------------------------
  const cfg = window.KAPPY_CONFIG || null;
  const AI_READY = !!(cfg && cfg.GROQ_API_KEY && !/PASTE_YOUR/.test(cfg.GROQ_API_KEY));
  let mode = 'kapil'; // 'kapil' = about Kapil, 'verse' = general Kappyverse
  const histKapil = [];
  const histVerse = [];

  async function askGroq(userText, systemPrompt, hist) {
    const msgs = [{ role: 'system', content: systemPrompt }]
      .concat(hist.slice(-8))
      .concat([{ role: 'user', content: userText }]);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.GROQ_API_KEY },
      body: JSON.stringify({ model: cfg.GROQ_MODEL || 'llama-3.3-70b-versatile', messages: msgs, temperature: mode === 'verse' ? 0.6 : 0.4, max_tokens: 600 })
    });
    if (!res.ok) throw new Error('groq ' + res.status);
    const data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message.content || '').trim();
  }

  // Append an empty bot message bubble to a specific thread (used for async
  // replies, so a tab switch mid-request can't redirect the answer).
  function addMsgTo(thread, html, who) {
    const el = document.createElement('div');
    el.className = 'kmsg kmsg--' + who;
    el.innerHTML = html;
    thread.appendChild(el);
    if (thread === activeThread()) messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function respond(userText) {
    const myMode = mode;              // lock the mode for this request
    const thread = activeThread();    // lock the target thread
    const t = typing();

    if (myMode === 'verse') {
      if (!AI_READY) {
        setTimeout(() => {
          t.remove();
          const el = addMsgTo(thread, '', 'bot');
          streamHTML(el, "✦ <strong>Kappyverse</strong> is powered by <strong>Kapil's own AI model</strong>, which is being connected right now. In the meantime, I'd love to tell you about <strong>Kapil</strong> — just switch to the <em>About Kapil</em> tab! 😊");
        }, 300);
        return;
      }
      askGroq(userText, KB.VERSE_PROMPT, histVerse).then((reply) => {
        t.remove();
        const el = addMsgTo(thread, '', 'bot');
        histVerse.push({ role: 'user', content: userText });
        streamText(el, reply || "I couldn't find an answer for that, but I'm happy to try another question. 😊", () => histVerse.push({ role: 'assistant', content: reply }));
      }).catch(() => {
        t.remove();
        addMsgTo(thread, "I'm having trouble reaching my knowledge engine right now. Please try again in a moment. 🙏", 'bot');
      });
      return;
    }

    // About-Kapil mode
    if (AI_READY) {
      askGroq(userText, KB.SYSTEM_PROMPT, histKapil).then((reply) => {
        t.remove();
        const el = addMsgTo(thread, '', 'bot');
        histKapil.push({ role: 'user', content: userText });
        streamText(el, reply || KB.FALLBACK.replace(/<[^>]+>/g, ''), () => histKapil.push({ role: 'assistant', content: reply }));
      }).catch(() => {
        t.remove();
        const el = addMsgTo(thread, '', 'bot');
        streamHTML(el, KB.answer(userText));
      });
    } else {
      const delay = 350 + Math.random() * 300;
      setTimeout(() => { t.remove(); const el = addMsgTo(thread, '', 'bot'); streamHTML(el, KB.answer(userText)); }, delay);
    }
  }

  function buildChips() {
    chips.innerHTML = '';
    const list = mode === 'verse' ? KB.VERSE_CHIPS : KB.CHIPS;
    list.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.label;
      b.addEventListener('click', () => {
        addMsg(escapeHTML(c.label), 'user');
        respond(c.q);
      });
      chips.appendChild(b);
    });
  }

  // --- Mode tabs ----------------------------------------------------------
  const tabs = document.getElementById('kappyTabs');
  const statusEl = document.getElementById('kappyStatus');
  const seededMode = {}; // which modes have shown their intro
  function switchMode(next) {
    if (next === mode) return;
    mode = next;
    tabs.querySelectorAll('.kappy__tab').forEach(b => b.classList.toggle('is-active', b.dataset.mode === next));
    statusEl.textContent = next === 'verse' ? 'Kappyverse · general knowledge' : "Kapil's AI assistant";
    text.placeholder = next === 'verse' ? 'Ask me anything…' : 'Ask about skills, projects, experience…';
    // Show only this mode's thread — the other stays hidden, never mixed.
    threadKapil.style.display = next === 'verse' ? 'none' : '';
    threadVerse.style.display = next === 'verse' ? '' : 'none';
    buildChips();
    if (!seededMode[next]) {
      seededMode[next] = true;
      const t = typing();
      const intro = next === 'verse' ? KB.VERSE_WELCOME : KB.WELCOME;
      setTimeout(() => { t.remove(); addMsg(intro, 'bot'); }, 450);
    }
    messages.scrollTop = messages.scrollHeight;
  }
  tabs && tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.kappy__tab');
    if (b) switchMode(b.dataset.mode);
  });

  function openChat() {
    opened = true;
    windowEl.classList.add('open');
    windowEl.setAttribute('aria-hidden', 'false');
    badge.classList.add('hide');
    bubble.classList.remove('show');
    if (!welcomed) {
      welcomed = true;
      seededMode.kapil = true;
      buildChips();
      const t = typing();
      setTimeout(() => { t.remove(); addMsg(KB.WELCOME, 'bot'); }, 600);
    }
    setTimeout(() => text.focus(), 420);
  }

  function closeChat() {
    windowEl.classList.remove('open');
    windowEl.setAttribute('aria-hidden', 'true');
  }

  launcher.addEventListener('click', () => {
    windowEl.classList.contains('open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = text.value.trim();
    if (!val) return;
    addMsg(val.replace(/</g, '&lt;'), 'user');
    text.value = '';
    respond(val);
  });

  // Esc closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && windowEl.classList.contains('open')) closeChat();
  });

  // expose so command menu / other buttons can open Kappy
  window.openKappy = openChat;
})();
