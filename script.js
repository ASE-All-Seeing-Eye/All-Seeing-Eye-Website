const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const hero = document.querySelector(".hero");
const heroVisual = document.querySelector("[data-hero-visual]");
let menuHideTimer;

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);

  if (heroVisual && hero) {
    const progress = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
    heroVisual.style.setProperty("--hero-scroll", progress.toFixed(3));
  }
}

function setMenu(open) {
  if (!menuButton || !mobileMenu) return;

  window.clearTimeout(menuHideTimer);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  mobileMenu.inert = !open;
  mobileMenu.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);

  if (open) {
    mobileMenu.hidden = false;
    requestAnimationFrame(() => {
      if (menuButton.getAttribute("aria-expanded") === "true") {
        mobileMenu.classList.add("is-open");
      }
    });
    return;
  }

  mobileMenu.classList.remove("is-open");
  menuHideTimer = window.setTimeout(() => {
    if (menuButton.getAttribute("aria-expanded") === "false") {
      mobileMenu.hidden = true;
    }
  }, reducedMotion.matches ? 0 : 650);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || menuButton?.getAttribute("aria-expanded") !== "true") return;
  setMenu(false);
  menuButton.focus();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1080) setMenu(false);
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

class LogoShine {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.frame = null;

    this.maskCanvas = document.createElement("canvas");
    this.maskCanvas.width = this.width;
    this.maskCanvas.height = this.height;
    this.maskContext = this.maskCanvas.getContext("2d", { willReadFrequently: true });

    this.shineCanvas = document.createElement("canvas");
    this.shineCanvas.width = this.width;
    this.shineCanvas.height = this.height;
    this.shineContext = this.shineCanvas.getContext("2d");

    this.animate = this.animate.bind(this);

    const logoImage = new Image();
    logoImage.decoding = "async";
    logoImage.addEventListener("load", () => this.prepareMask(logoImage));
    logoImage.src = "assets/ase-logo-simple.jpg";
  }

  prepareMask(logoImage) {
    const context = this.maskContext;
    context.clearRect(0, 0, this.width, this.height);
    context.drawImage(logoImage, 0, 0, this.width, this.height);

    let imageData;

    try {
      imageData = context.getImageData(0, 0, this.width, this.height);
    } catch {
      return;
    }

    const pixels = imageData.data;
    const cornerOffsets = [
      0,
      (this.width - 1) * 4,
      (this.height - 1) * this.width * 4,
      (this.width * this.height - 1) * 4,
    ];
    const backgroundLuminance = cornerOffsets.reduce((sum, offset) => (
      sum + (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3
    ), 0) / cornerOffsets.length;
    const lightBackground = backgroundLuminance > 127;

    for (let offset = 0; offset < pixels.length; offset += 4) {
      const luminance = (
        pixels[offset] * 0.2126 +
        pixels[offset + 1] * 0.7152 +
        pixels[offset + 2] * 0.0722
      );
      const contrast = lightBackground ? 255 - luminance : luminance;
      const alpha = Math.max(0, Math.min(255, (contrast - 18) * 1.18));

      pixels[offset] = 255;
      pixels[offset + 1] = 255;
      pixels[offset + 2] = 255;
      pixels[offset + 3] = alpha;
    }

    context.putImageData(imageData, 0, 0);
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(491, 568, 74, 0, Math.PI * 2);
    context.fill();
    context.restore();

    this.canvas.dataset.shineReady = "true";
    this.frame = requestAnimationFrame(this.animate);
  }

  paint(progress) {
    const context = this.context;
    const shine = this.shineContext;
    context.clearRect(0, 0, this.width, this.height);

    if (progress < 0.03 || progress > 0.86) return;

    const travel = (progress - 0.03) / 0.83;
    const easedTravel = (1 - Math.cos(Math.PI * travel)) / 2;
    const centerX = -230 + (this.width + 460) * easedTravel;
    const centerY = -230 + (this.height + 460) * easedTravel;
    const gradientReach = 155 / Math.SQRT2;
    const edgeFade = Math.min(travel / 0.14, (1 - travel) / 0.14, 1);

    shine.clearRect(0, 0, this.width, this.height);
    const gradient = shine.createLinearGradient(
      centerX - gradientReach,
      centerY - gradientReach,
      centerX + gradientReach,
      centerY + gradientReach,
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.37, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.43, "rgba(255, 255, 255, .32)");
    gradient.addColorStop(0.48, "rgba(255, 255, 255, .94)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.52, "rgba(255, 255, 255, .94)");
    gradient.addColorStop(0.57, "rgba(255, 255, 255, .32)");
    gradient.addColorStop(0.63, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    shine.fillStyle = gradient;
    shine.fillRect(0, 0, this.width, this.height);
    shine.globalCompositeOperation = "destination-in";
    shine.drawImage(this.maskCanvas, 0, 0);
    shine.globalCompositeOperation = "source-over";

    context.save();
    context.globalAlpha = edgeFade;
    context.shadowColor = "rgba(255, 255, 255, 1)";
    context.shadowBlur = 22;
    context.drawImage(this.shineCanvas, 0, 0);
    context.restore();
    context.drawImage(this.shineCanvas, 0, 0);
  }

  animate(time) {
    this.paint((time % 4200) / 4200);
    this.frame = requestAnimationFrame(this.animate);
  }

  stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = null;
  }
}

const logoShineCanvas = document.querySelector("[data-logo-shine]");
if (logoShineCanvas && !reducedMotion.matches) {
  logoShineCanvas.shineEffect = new LogoShine(logoShineCanvas);
}

class MotionController {
  constructor() {
    this.pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      active: false,
    };
    this.eyes = [...document.querySelectorAll("[data-tracking-eye]")];
    this.motionWords = [...document.querySelectorAll("[data-motion-depth]")];
    this.frame = null;
    this.lastTime = performance.now();
    this.pointerInfluence = 0;

    this.animate = this.animate.bind(this);

    window.addEventListener("pointermove", (event) => {
      this.pointer.targetX = event.clientX;
      this.pointer.targetY = event.clientY;
      this.pointer.active = event.pointerType !== "touch";
    });

    document.documentElement.addEventListener("pointerleave", () => {
      this.pointer.active = false;
    });

    this.frame = requestAnimationFrame(this.animate);
  }

  animate(time) {
    const pointer = this.pointer;
    const deltaTime = Math.min(Math.max((time - this.lastTime) / 1000, 0), 0.05);
    const influenceEase = 1 - Math.exp(-3 * deltaTime);
    this.lastTime = time;

    const pointerEase = 1 - Math.exp(-(pointer.active ? 8 : 3.2) * deltaTime);

    pointer.x += (pointer.targetX - pointer.x) * pointerEase;
    pointer.y += (pointer.targetY - pointer.y) * pointerEase;
    this.pointerInfluence += (
      (pointer.active ? 1 : 0) - this.pointerInfluence
    ) * influenceEase;

    this.eyes.forEach((eye) => {
      const iris = eye.querySelector("[data-eye-iris]");
      if (!iris) return;

      const bounds = eye.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = pointer.x - centerX;
      const deltaY = pointer.y - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 430, 1);
      const referenceViewport = Number(eye.dataset.eyeReferenceViewport || window.innerWidth);
      const responsiveScale = Math.min(window.innerWidth / referenceViewport, 1);
      const range = Number(eye.dataset.eyeRange || 12) * responsiveScale;
      const verticalRatio = Number(eye.dataset.eyeYRatio || 0.62);
      const eyeX = Math.cos(angle) * range * distance * this.pointerInfluence;
      const eyeY = Math.sin(angle) * range * distance * verticalRatio * this.pointerInfluence;

      iris.style.transform = `translate3d(${eyeX.toFixed(2)}px, ${eyeY.toFixed(2)}px, 0)`;
    });

    if (heroVisual && hero) {
      const bounds = hero.getBoundingClientRect();
      const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;

      if (visible) {
        const x = pointer.x / window.innerWidth - 0.5;
        const y = pointer.y / window.innerHeight - 0.5;
        const interactionX = x * this.pointerInfluence;
        const interactionY = y * this.pointerInfluence;
        const floatPhase = time / 1050;
        const floatY = Math.sin(floatPhase) * 11;
        const floatPitch = Math.cos(floatPhase) * 1.25;
        const floatYaw = Math.sin(floatPhase) * 0.7;
        const floatRoll = Math.cos(floatPhase) * 0.55;

        heroVisual.style.setProperty("--float-y", `${floatY.toFixed(2)}px`);
        heroVisual.style.setProperty("--rotate-x", `${(-interactionY * 16 + floatPitch).toFixed(2)}deg`);
        heroVisual.style.setProperty("--rotate-y", `${(interactionX * 22 + floatYaw).toFixed(2)}deg`);
        heroVisual.style.setProperty("--rotate-z", `${floatRoll.toFixed(2)}deg`);

      }
    }

    const motionScale = Math.min(window.innerWidth / 880, 1);
    const pointerX = (pointer.x / window.innerWidth - 0.5) * this.pointerInfluence;
    const pointerY = (pointer.y / window.innerHeight - 0.5) * this.pointerInfluence;

    this.motionWords.forEach((word, index) => {
      const depth = Number(word.dataset.motionDepth || 1);
      const elementScale = Number(word.dataset.motionScale || 1);
      const idleX = Math.sin(time / 1750 + index * 1.17) * 3 * depth;
      const idleY = Math.cos(time / 2150 + index * 0.83) * 2 * depth;
      const wordX = (pointerX * 13 * depth + idleX) * motionScale * elementScale;
      const wordY = (pointerY * 8 * depth + idleY) * motionScale * elementScale;
      const wordRotation = (
        pointerX * 0.8 * depth +
        Math.sin(time / 2600 + index) * 0.075 * depth
      ) * elementScale;

      word.style.setProperty("--word-x", `${wordX.toFixed(2)}px`);
      word.style.setProperty("--word-y", `${wordY.toFixed(2)}px`);
      word.style.setProperty("--word-rotate", `${wordRotation.toFixed(3)}deg`);
    });

    this.frame = requestAnimationFrame(this.animate);
  }
}

if (!reducedMotion.matches) {
  new MotionController();

  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
      button.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      button.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
    });

    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--magnetic-x", "0px");
      button.style.setProperty("--magnetic-y", "0px");
    });
  });
}

function initTopology() {
  const topology = document.querySelector("[data-topology]");
  if (!topology) return;

  const nodes = [...topology.querySelectorAll("[data-topology-node]")].map((element) => ({
    element,
    id: element.dataset.topologyNode,
    x: Number(element.dataset.x),
    y: Number(element.dataset.y),
  }));
  const links = [...topology.querySelectorAll("[data-topology-link]")];
  const scanLine = topology.querySelector("[data-topology-scan]");

  const setActiveNode = (node) => {
    nodes.forEach(({ element }) => {
      element.classList.toggle("is-active", element === node?.element);
    });
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.topologyLink === node?.id);
    });
    scanLine?.classList.toggle("is-active", Boolean(node));

    if (scanLine && node) {
      scanLine.setAttribute("x2", String(node.x));
      scanLine.setAttribute("y2", String(node.y));
    }
  };

  topology.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    const bounds = topology.getBoundingClientRect();
    const viewBox = topology.viewBox.baseVal;
    const pointX = viewBox.x + ((event.clientX - bounds.left) / bounds.width) * viewBox.width;
    const pointY = viewBox.y + ((event.clientY - bounds.top) / bounds.height) * viewBox.height;
    const nearest = nodes.reduce((closest, node) => {
      const distance = Math.hypot(pointX - node.x, pointY - node.y);
      return !closest || distance < closest.distance
        ? { node, distance }
        : closest;
    }, null);

    setActiveNode(nearest && nearest.distance < 205 ? nearest.node : null);
  });

  topology.addEventListener("pointerleave", () => setActiveNode(null));
}

initTopology();

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
    this.surface = canvas.closest("[data-network-surface]") || canvas.parentElement;
    this.nodes = [];
    this.animationFrame = null;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.pointer = { x: -9999, y: -9999 };
    this.pointerInfluenceRadius = 72;

    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);

    window.addEventListener("resize", this.resize);
    this.surface?.addEventListener("pointermove", (event) => {
      const bounds = this.canvas.getBoundingClientRect();
      this.pointer.x = event.clientX - bounds.left;
      this.pointer.y = event.clientY - bounds.top;
    });
    this.surface?.addEventListener("pointerleave", () => {
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

    const configuredDensity = Number(this.canvas.dataset.networkDensity);
    const density = configuredDensity || (window.innerWidth < 700 ? 12000 : 9000);
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

    if (this.pointer.x >= 0 && this.pointer.y >= 0) {
      const radius = this.pointerInfluenceRadius;
      const glow = context.createRadialGradient(
        this.pointer.x,
        this.pointer.y,
        0,
        this.pointer.x,
        this.pointer.y,
        radius,
      );
      glow.addColorStop(0, "rgba(162, 242, 255, .15)");
      glow.addColorStop(0.3, "rgba(69, 220, 255, .055)");
      glow.addColorStop(0.68, "rgba(69, 220, 255, .018)");
      glow.addColorStop(1, "rgba(69, 220, 255, 0)");
      context.fillStyle = glow;
      context.fillRect(
        this.pointer.x - radius,
        this.pointer.y - radius,
        radius * 2,
        radius * 2,
      );
    }

    this.nodes.forEach((node, index) => {
      if (!staticFrame) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -10 || node.x > this.width + 10) node.vx *= -1;
        if (node.y < -10 || node.y > this.height + 10) node.vy *= -1;
      }

      const pointerDeltaX = node.x - this.pointer.x;
      const pointerDeltaY = node.y - this.pointer.y;
      const pointerDistance = Math.hypot(pointerDeltaX, pointerDeltaY);
      const pointerInfluence = Math.max(
        0,
        1 - pointerDistance / this.pointerInfluenceRadius,
      );

      if (!staticFrame && pointerInfluence > 0 && pointerDistance > 0.01) {
        const repelStrength = pointerInfluence * 0.65;
        node.x += (pointerDeltaX / pointerDistance) * repelStrength;
        node.y += (pointerDeltaY / pointerDistance) * repelStrength;
      }

      if (pointerInfluence > 0.04) {
        context.beginPath();
        context.moveTo(this.pointer.x, this.pointer.y);
        context.lineTo(node.x, node.y);
        context.strokeStyle = `rgba(69, 220, 255, ${pointerInfluence * 0.24})`;
        context.lineWidth = 0.65;
        context.stroke();
      }

      context.beginPath();
      context.arc(
        node.x,
        node.y,
        node.radius * (1 + pointerInfluence * 1.65),
        0,
        Math.PI * 2,
      );
      context.fillStyle = `rgba(111, 232, 255, ${0.44 + pointerInfluence * 0.44})`;
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

document.querySelectorAll("[data-network-canvas]").forEach((canvas) => {
  new NetworkField(canvas);
});
