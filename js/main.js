const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

const progressBar = document.getElementById("progressBar");
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  nav.classList.toggle("scrolled", window.scrollY > 10);
  const max = doc.scrollHeight - doc.clientHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
  toTop.classList.toggle("show", doc.scrollTop > 600);
}, { passive: true });

toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".section-title, .section-sub, .card, .sobre-text, .sobre-visual, .contact-info, .contact-form").forEach((el) => {
  el.classList.add("reveal");
  const index = [...el.parentElement.children].indexOf(el);
  el.style.transitionDelay = `${Math.min(index, 5) * 90}ms`;
  observer.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();

const glow = document.getElementById("cursorGlow");
if (glow && finePointer && !prefersReducedMotion) {
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });
  (function animate() {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    glow.style.transform = `translate(${x - 260}px, ${y - 260}px)`;
    requestAnimationFrame(animate);
  })();
}

if (finePointer && !prefersReducedMotion) {
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2;
      const dy = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${dx * 0.12}px, ${dy * 0.22}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

const FORM_ENDPOINT = "https://formspree.io/f/xbgdyqdg";

const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";
  status.className = "form-status";

  const fields = [
    document.getElementById("nombre"),
    document.getElementById("email"),
    document.getElementById("mensaje"),
  ];

  let valid = true;
  fields.forEach((field) => {
    field.classList.remove("invalid");
    const empty = !field.value.trim();
    const badEmail = field.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    if (empty || badEmail) {
      field.classList.add("invalid");
      valid = false;
    }
  });

  if (!valid) {
    status.textContent = "Revisá los campos marcados.";
    status.classList.add("error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  const data = {
    nombre: fields[0].value.trim(),
    email: fields[1].value.trim(),
    mensaje: fields[2].value.trim(),
  };

  if (FORM_ENDPOINT.includes("TU_FORM_ID")) {
    const mailto = `mailto:poggiooabril@gmail.com?subject=${encodeURIComponent("Nuevo mensaje desde TheWebLab - " + data.nombre)}&body=${encodeURIComponent(data.mensaje + "\n\nResponder a: " + data.email)}`;
    window.location.href = mailto;
    status.textContent = "Se abrió tu correo para enviar el mensaje.";
    status.classList.add("ok");
    form.reset();
  } else {
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        status.textContent = "¡Mensaje enviado! Te respondo a la brevedad.";
        status.classList.add("ok");
        form.reset();
      } else {
        throw new Error("Error en el envío");
      }
    } catch {
      status.textContent = "Hubo un problema al enviar. Probá con el enlace de email o WhatsApp.";
      status.classList.add("error");
    }
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Enviar mensaje";
});
