
const GITHUB_USER = "khushi-n-murthy";

const PROJECTS = [
  {
    name: "PreCrash-SOS",
    tag: "AI · Road safety",
    desc: "Predictive emergency dispatch system that flags high-risk road segments using accident, weather and time-of-day data — so ambulances and trauma centres can be positioned before a crash happens.",
    lang: "HTML",
    repo: "PreCrash-SOS",
  },
  {
    name: "BinGo-Bengaluru",
    tag: "AI · Civic tech",
    desc: "Smart sanitation platform that turns waste reporting and cleaning operations into a transparent, real-time, data-driven system, deployed on AWS.",
    lang: "JavaScript",
    repo: "BinGo-Bengaluru",
  },
  {
    name: "CogniShield",
    tag: "Android · Wellbeing",
    desc: "Edge-first Android app that fuses on-device sensor signals to estimate the user's mental state in real time and automatically trigger digital interventions.",
    lang: "Kotlin",
    repo: "CogniShield",
  },
  {
    name: "EduGuard",
    tag: "AI · Education",
    desc: "Student retention system that predicts dropout risk from attendance, academic performance and engagement data, and recommends personalised interventions.",
    lang: "TypeScript",
    repo: "eduguard",
  },
  {
    name: "Smart Resume Analyzer",
    tag: "AI · Careers",
    desc: "End-to-end web platform that helps job seekers optimise their résumés for Applicant Tracking Systems, with an AI career assistant for guidance.",
    lang: "Python",
    repo: "smart-resume-analyzer",
  },
  {
    name: "c-mat-lib",
    tag: "Systems · ML from scratch",
    desc: "A simplified AI training and optimisation engine written in C, showing how matrix-based batch computation speeds up model training versus sequential computation.",
    lang: "C",
    repo: "c-mat-lib",
  },
];

const ICON_STAR = `<svg class="ico" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>`;
const ICON_EXT = `<svg class="ico" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;

const LANG_COLORS = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  C: "#555555",
  "C++": "#f34b7d",
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

(function theme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (_) {}
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  root.dataset.theme = saved || (prefersLight ? "light" : "dark");

  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (_) {}
  });
})();

(function mobileNav() {
  const burger = $("#burger");
  const links = $("#navLinks");
  const close = () => {
    links.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach((a) => a.addEventListener("click", close));
})();

(function navState() {
  const nav = $("#nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 10);
  }, { passive: true });

  const navLinks = $$("#navLinks a");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
        );
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach((s) => observer.observe(s));
})();

(function typewriter() {
  const el = $("#typed");
  const words = [
    "AI-powered tools",
    "Android apps",
    "data-driven platforms",
    "things in C, from scratch",
    "solutions for Bengaluru",
  ];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let w = 0, i = words[0].length, deleting = true;
  setTimeout(function tick() {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);

    let delay = deleting ? 40 : 80;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  }, 2000);
})();

(function gridDeco() {
  const grid = $("#gridDeco");
  const cols = window.innerWidth < 860 ? 14 : 18;
  const cells = cols * cols;
  const frag = document.createDocumentFragment();
  const randomLevel = () => {
    const r = Math.random();
    return r < 0.55 ? 0 : r < 0.75 ? 1 : r < 0.88 ? 2 : r < 0.96 ? 3 : 4;
  };
  for (let n = 0; n < cells; n++) {
    const s = document.createElement("span");
    s.dataset.l = randomLevel();
    frag.appendChild(s);
  }
  grid.appendChild(frag);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const spans = grid.children;
  setInterval(() => {
    for (let k = 0; k < 6; k++) {
      spans[Math.floor(Math.random() * spans.length)].dataset.l = randomLevel();
    }
  }, 500);
})();

let revealObserver;
function observeReveals() {
  if (!("IntersectionObserver" in window)) {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }
  revealObserver ||= new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal:not(.is-visible)").forEach((el) => revealObserver.observe(el));
}

function renderProjects(stars = {}) {
  const grid = $("#projectGrid");
  grid.innerHTML = PROJECTS.map((p) => {
    const color = LANG_COLORS[p.lang] || "#888";
    const repoUrl = `https://github.com/${GITHUB_USER}/${p.repo}`;
    const starCount = stars[p.repo.toLowerCase()];
    return `
      <article class="card reveal" data-lang="${p.lang}">
        <div class="card__top">
          <div>
            <span class="card__tag">${p.tag}</span>
            <h3 class="card__title">${p.name}</h3>
          </div>
          ${starCount ? `<span class="stars" title="GitHub stars">${ICON_STAR}${starCount}</span>` : ""}
        </div>
        <p class="card__desc">${p.desc}</p>
        <div class="card__foot">
          <span class="lang"><span class="lang__dot" style="background:${color}"></span>${p.lang}</span>
          <span class="card__links">
            ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener">Live${ICON_EXT}</a>` : ""}
            <a href="${repoUrl}" target="_blank" rel="noopener">Code${ICON_EXT}</a>
          </span>
        </div>
      </article>`;
  }).join("");

  $$(".card", grid).forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  observeReveals();
}

(function filters() {
  const bar = $("#filters");
  const langs = [...new Set(PROJECTS.map((p) => p.lang))];
  langs.forEach((lang) => {
    const b = document.createElement("button");
    b.className = "filter";
    b.dataset.filter = lang;
    b.textContent = lang;
    bar.appendChild(b);
  });

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter", bar).forEach((b) => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    $$("#projectGrid .card").forEach((card) => {
      card.classList.toggle("is-hidden", f !== "all" && card.dataset.lang !== f);
    });
  });
})();

renderProjects();
(async function liveGitHub() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`),
    ]);
    if (userRes.ok) {
      const user = await userRes.json();
      if (user.public_repos) $("#statRepos").textContent = user.public_repos;
    }
    if (reposRes.ok) {
      const repos = await reposRes.json();
      const stars = {};
      repos.forEach((r) => { if (r.stargazers_count) stars[r.name.toLowerCase()] = r.stargazers_count; });
      renderProjects(stars);
    }
  } catch (_) { /* keep static content */ }
})();

observeReveals();

(function copyEmail() {
  const btn = $("#copyEmail");
  const toast = $("#toast");
  const show = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 2000);
  };
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      show("Email copied to clipboard");
    } catch (_) {
      show(btn.dataset.email);
    }
  });
})();

$("#year").textContent = new Date().getFullYear();