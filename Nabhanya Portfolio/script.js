(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const nav = $("#nav");
  const progress = $("#progress");
  const menuBtn = $("#menuBtn");
  const navLinks = $("#navLinks");

  /* Footer year */
  $("#year").textContent = new Date().getFullYear();

  /* Scroll: nav state + progress bar */
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("scrolled", y > 20);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const setMenu = (open) => {
    menuBtn.classList.toggle("open", open);
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* Reveal on scroll (with small stagger for siblings) */
  const revealEls = $$(".reveal");
  revealEls.forEach((el) => {
    const siblings = $$(".reveal", el.parentElement);
    el.style.setProperty("--d", Math.min(siblings.indexOf(el), 4) * 0.08 + "s");
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* Active nav link on scroll */
  const links = $$(".nav-links a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
        }
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* Cursor glow (fine pointers only) */
  const glow = $("#glow");
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      glow.style.setProperty("--mx", e.clientX + "px");
      glow.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  /* Project card spotlight */
  $$(".project").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--px", e.clientX - r.left + "px");
      card.style.setProperty("--py", e.clientY - r.top + "px");
    });
  });
})();
