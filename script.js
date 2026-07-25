const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const hero = document.querySelector(".hero");
const heroVisual = document.querySelector("[data-hero-visual]");
const cursorLight = document.querySelector(".cursor-light");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);

  if (heroVisual && hero) {
    const progress = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
    heroVisual.style.setProperty("--hero-scroll", progress.toFixed(3));
  }
}

function setMenu(open) {
  if (!menuButton || !mobileMenu) return;

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  mobileMenu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1080) setMenu(false);
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (!reducedMotion.matches) {
  window.addEventListener("pointermove", (event) => {
    if (cursorLight) {
      cursorLight.style.left = `${event.clientX}px`;
      cursorLight.style.top = `${event.clientY}px`;
    }

    if (!heroVisual || !hero) return;

    const bounds = hero.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      return;
    }

    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    heroVisual.style.setProperty("--rotate-x", `${(-y * 3.4).toFixed(2)}deg`);
    heroVisual.style.setProperty("--rotate-y", `${(x * 4.6).toFixed(2)}deg`);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.08,
  },
);

document.querySelectorAll("[data-reveal]").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

document.querySelectorAll("[data-dialog-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.dialogOpen);
    dialog?.showModal();
  });
});

document.querySelectorAll(".legal-dialog").forEach((dialog) => {
  dialog.querySelector("[data-dialog-close]")?.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!inside) dialog.close();
  });
});

document.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());

class NetworkField {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.nodes = [];
    this.animationFrame = null;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.pointer = { x: -9999, y: -9999 };

    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);

    window.addEventListener("resize", this.resize);
    hero?.addEventListener("pointermove", (event) => {
      const bounds = this.canvas.getBoundingClientRect();
      this.pointer.x = event.clientX - bounds.left;
      this.pointer.y = event.clientY - bounds.top;
    });
    hero?.addEventListener("pointerleave", () => {
      this.pointer.x = -9999;
      this.pointer.y = -9999;
    });

    this.resize();
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    this.width = Math.max(bounds.width, 1);
    this.height = Math.max(bounds.height, 1);
    this.canvas.width = Math.floor(this.width * this.pixelRatio);
    this.canvas.height = Math.floor(this.height * this.pixelRatio);
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    const density = window.innerWidth < 700 ? 12000 : 9000;
    const count = Math.min(Math.floor((this.width * this.height) / density), 110);

    this.nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.13,
      vy: (Math.random() - 0.5) * 0.13,
      radius: index % 11 === 0 ? 1.8 : 1,
    }));

    if (reducedMotion.matches) {
      this.draw(true);
    } else if (!this.animationFrame) {
      this.draw();
    }
  }

  draw(staticFrame = false) {
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);

    this.nodes.forEach((node, index) => {
      if (!staticFrame) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -10 || node.x > this.width + 10) node.vx *= -1;
        if (node.y < -10 || node.y > this.height + 10) node.vy *= -1;
      }

      const pointerDistance = Math.hypot(node.x - this.pointer.x, node.y - this.pointer.y);
      const highlighted = pointerDistance < 150;

      context.beginPath();
      context.arc(node.x, node.y, highlighted ? node.radius * 1.7 : node.radius, 0, Math.PI * 2);
      context.fillStyle = highlighted ? "rgba(111, 232, 255, .88)" : "rgba(111, 232, 255, .44)";
      context.fill();

      for (let nextIndex = index + 1; nextIndex < this.nodes.length; nextIndex += 1) {
        const next = this.nodes[nextIndex];
        const distance = Math.hypot(node.x - next.x, node.y - next.y);
        const limit = window.innerWidth < 700 ? 92 : 126;

        if (distance > limit) continue;

        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(next.x, next.y);
        context.strokeStyle = `rgba(69, 220, 255, ${(1 - distance / limit) * 0.15})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
    });

    if (!staticFrame) {
      this.animationFrame = requestAnimationFrame(() => this.draw());
    }
  }
}

const networkCanvas = document.querySelector("[data-network-canvas]");
if (networkCanvas) new NetworkField(networkCanvas);
