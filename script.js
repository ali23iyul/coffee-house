// Helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// Custom cursor (safe if elements missing)
const dot = $('.cursor-dot');
const outline = $('.cursor-outline');
if (dot && outline) {
  let x = 0, y = 0;
  window.addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    outline.style.transform = `translate(${x}px, ${y}px)`;
  });
  $$('a, button, .chip, .menu-item, .slide-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      outline.style.width = '36px';
      outline.style.height = '36px';
      outline.style.borderColor = 'rgba(213,123,63,0.9)';
    });
    el.addEventListener('mouseleave', () => {
      outline.style.width = '24px';
      outline.style.height = '24px';
      outline.style.borderColor = 'rgba(213,123,63,0.6)';
    });
  });
}

// Smooth anchors
$$('.nav a, .cta .btn').forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.startsWith('#')) {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = $(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});

// Lightweight parallax
const layers = $$('.layer');
if (layers.length) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const s = window.scrollY;
      layers.forEach((layer, i) => {
        const dir = i === 0 ? -1 : 1;
        const speed = (i + 1) * 0.03;
        layer.style.transform = `translateY(${dir * s * speed}px) scale(1.02)`;
      });
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Reveal animations via IntersectionObserver
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
      const section = entry.target.closest('.section');
      if (section) section.classList.add('in'); // underline accent animation
    }
  });
}, { threshold: 0.12 });
$$('.reveal, .section-head').forEach(el => io.observe(el));

// Menu filters
const chips = $$('.chip');
const items = $$('.menu-item');
if (chips.length && items.length) {
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter || 'all';
    items.forEach(item => {
      const show = f === 'all' || item.dataset.cat === f;
      item.style.display = show ? '' : 'none';
    });
  }));
}

// Price magnet hover
$$('.menu-item').forEach(card => {
  const price = card.querySelector('.price');
  if (!price) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    price.style.transform = `translate(${x * 0.02}px, ${y * 0.02}px)`;
  });
  card.addEventListener('mouseleave', () => {
    price.style.transform = 'translate(0,0)';
  });
});

// Gallery slider
const slidesEl = $('.slides');
const dotsWrap = $('.slider-dots');
const prevBtn = $('.slide-btn.prev');
const nextBtn = $('.slide-btn.next');
let index = 0;

if (slidesEl && dotsWrap) {
  const slideCount = slidesEl.children.length;

  // Dots
  for (let i = 0; i < slideCount; i++) {
    const b = document.createElement('button');
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  }
  const dots = dotsWrap.querySelectorAll('button');

  function goTo(i) {
    index = Math.max(0, Math.min(i, slideCount - 1));
    slidesEl.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));
  

  // Autoplay with hover pause
  let autoplay = setInterval(() => goTo((index + 1) % slideCount), 6000);
  slidesEl.addEventListener('mouseenter', () => clearInterval(autoplay));
  slidesEl.addEventListener('mouseleave', () => {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo((index + 1) % slideCount), 6000);
  });
}

// Reserve form (demo)}
const form = document.querySelector('.reserve-form');
const msg = document.querySelector('.form-msg');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    name: form.name.value,
    phone: form.phone.value,
    date: form.date.value,
    time: form.time.value,
    note: form.note.value
  };

  const res = await fetch('http://localhost:5000/api/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  msg.textContent = result.message;
  msg.style.color = 'var(--accent)';
  form.reset();
});
