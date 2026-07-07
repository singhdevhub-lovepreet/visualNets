/* ─── Scroll Reveal (Intersection Observer) ─── */
(function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();

/* ─── Attention Heatmap Grid ─── */
(function initAttentionGrid() {
  var grid = document.getElementById('attention-grid');
  if (!grid) return;

  var weights = [
    0.9, 0.2, 0.4, 0.1,
    0.3, 0.85, 0.15, 0.5,
    0.1, 0.3, 0.95, 0.2,
    0.4, 0.1, 0.3, 0.8
  ];

  weights.forEach(function (w) {
    var cell = document.createElement('div');
    cell.className = 'attention-cell';
    // Cyan-based heatmap
    var r = Math.round(126 * w);
    var g = Math.round(200 * w);
    var b = Math.round(227 * w);
    cell.style.background = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.15 + w * 0.85) + ')';
    grid.appendChild(cell);
  });
})();

/* ─── QKV Bar Animation on Hover ─── */
(function initQKVAnimation() {
  var qkvTarget = document.querySelector('[data-viz="qkv"]');
  if (!qkvTarget) return;

  var bars = qkvTarget.querySelectorAll('.qkv-bar');
  var baseHeights = [32, 44, 28];
  var animationFrame = null;

  qkvTarget.addEventListener('mouseenter', function () {
    animate();
  });

  qkvTarget.addEventListener('mouseleave', function () {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    bars.forEach(function (bar, i) {
      bar.style.height = baseHeights[i] + 'px';
    });
  });

  function animate() {
    var t = Date.now() / 600;
    bars.forEach(function (bar, i) {
      var h = baseHeights[i] + Math.sin(t + i * 1.8) * 10;
      bar.style.height = h + 'px';
    });
    animationFrame = requestAnimationFrame(animate);
  }
})();

/* ─── Attention Heatmap Animation on Hover ─── */
(function initAttentionAnimation() {
  var attentionTarget = document.querySelector('[data-viz="attention"]');
  if (!attentionTarget) return;

  var cells = attentionTarget.querySelectorAll('.attention-cell');
  var animationFrame = null;

  var baseWeights = [
    0.9, 0.2, 0.4, 0.1,
    0.3, 0.85, 0.15, 0.5,
    0.1, 0.3, 0.95, 0.2,
    0.4, 0.1, 0.3, 0.8
  ];

  attentionTarget.addEventListener('mouseenter', function () {
    animateGrid();
  });

  attentionTarget.addEventListener('mouseleave', function () {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    cells.forEach(function (cell, i) {
      var w = baseWeights[i];
      var r = Math.round(126 * w);
      var g = Math.round(200 * w);
      var b = Math.round(227 * w);
      cell.style.background = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.15 + w * 0.85) + ')';
    });
  });

  function animateGrid() {
    var t = Date.now() / 1000;
    cells.forEach(function (cell, i) {
      var w = baseWeights[i] + Math.sin(t * 2 + i * 0.7) * 0.2;
      w = Math.max(0.05, Math.min(1, w));
      var r = Math.round(126 * w);
      var g = Math.round(200 * w);
      var b = Math.round(227 * w);
      cell.style.background = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.15 + w * 0.85) + ')';
    });
    animationFrame = requestAnimationFrame(animateGrid);
  }
})();

/* ─── Smooth Scroll for Anchor Links ─── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
