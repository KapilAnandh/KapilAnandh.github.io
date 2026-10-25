# Kapil Anandh P — Portfolio

A senior-level personal portfolio for **Kapil Anandh P**, Generative AI & AI/ML Engineer.
Dark "inside the model" theme, scroll-driven animations, an interactive neural-network
background, project case studies, and **Kappy** — a cute built-in chatbot that answers
questions about Kapil.

**Live site:** https://kapilanandh.github.io/Portfolio/

## Tech

- Plain HTML + CSS + JavaScript (no build step, no framework)
- [GSAP](https://gsap.com/) + ScrollTrigger for scroll animations
- [Lenis](https://lenis.darkroom.engineering/) for smooth scrolling
- Canvas 2D neural-network hero background
- Offline chatbot (keyword + fuzzy intent matching, no API key)
- Deployed with GitHub Actions to GitHub Pages

## Run it locally

No Node.js needed. Any static server works. Two easy options on Windows:

**Option A — Python (recommended):**

```powershell
# from the project folder
python -m http.server 5500
```

Then open <http://localhost:5500> in your browser.

**Option B — VS Code Live Server:**
Install the "Live Server" extension, then right-click `index.html` → *Open with Live Server*.

> Tip: open it through a local server rather than double-clicking `index.html`,
> so the resume download and all relative paths behave exactly like the live site.

## Project structure

```
Portfolio/
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js          # animations, cursor, scroll, command menu
│   │   ├── neural-bg.js     # hero neural-network canvas
│   │   ├── chatbot.js       # Kappy UI
│   │   └── knowledge.js     # Kappy's answers
│   ├── img/                 # portrait, avatar, OG cover, favicon
│   └── Kapil_Anandh_Resume.pdf
└── .github/workflows/deploy.yml
```

## Editing the chatbot

Kappy's answers live in `assets/js/knowledge.js`. Add or edit an entry in the
`intents` array (keywords + reply) to teach it something new.

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which publishes the
site to GitHub Pages automatically.
