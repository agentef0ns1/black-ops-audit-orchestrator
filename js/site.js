(function () {
  var config = window.SITE_CONFIG || {};
  var email = (config.contactEmail || "").trim();
  var linkedin = (config.contactLinkedIn || "").trim();
  function fillEmail() {
    var pack = (window.SITE_I18N && window.SITE_I18N.pack) || {};
    document.querySelectorAll("[data-contact-email]").forEach(function (node) {
      if (!email) {
        node.textContent = pack["contact.missing"] || "Set contactEmail in js/config.js";
        return;
      }
      node.textContent = email;
      if (node.tagName === "A") node.href = "mailto:" + email;
    });
    document.querySelectorAll("[data-contact-linkedin]").forEach(function (node) {
      if (!linkedin) {
        node.hidden = true;
        return;
      }
      node.hidden = false;
      if (node.tagName === "A") node.href = linkedin;
    });
  }

  fillEmail();
  window.addEventListener("site-lang", fillEmail);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-r]").forEach(function (node) {
    if (reduce || !("IntersectionObserver" in window)) {
      node.classList.add("in");
      return;
    }
  });
  if (!reduce && "IntersectionObserver" in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        reveal.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll("[data-r]").forEach(function (node) {
      reveal.observe(node);
    });
  }

  document.querySelectorAll(".cosmos").forEach(startField);

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var sections = links.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  var byId = {};
  links.forEach(function (link) {
    byId[link.getAttribute("href").slice(1)] = link;
  });

  var here = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = byId[entry.target.id];
      if (!link || !entry.isIntersecting) return;
      links.forEach(function (item) { item.classList.remove("is-here"); });
      link.classList.add("is-here");
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });

  sections.forEach(function (section) { here.observe(section); });

  function startField(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w = 0;
    var h = 0;
    var dpr = 1;

    function resize() {
      var box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width;
      h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(110, Math.max(36, (w * h) / 9000)));
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random(),
          r: 0.4 + Math.random() * 1.15,
          c: Math.random() < 0.84 ? "255,255,255" : (Math.random() < 0.5 ? "225,29,72" : "192,132,252")
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i;
      for (i = 0; i < stars.length; i++) {
        var star = stars[i];
        ctx.fillStyle = "rgba(" + star.c + "," + (0.22 + star.z * 0.5) + ")";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.lineWidth = 1;
      for (i = 0; i < stars.length; i += 6) {
        var next = stars[i + 3];
        if (!next) continue;
        var dx = stars[i].x - next.x;
        var dy = stars[i].y - next.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 110) continue;
        ctx.strokeStyle = "rgba(192,132,252," + (1 - dist / 110) * 0.35 + ")";
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
      if (!reduce) {
        for (i = 0; i < stars.length; i++) {
          stars[i].y -= 0.04 + stars[i].z * 0.12;
          if (stars[i].y < -4) stars[i].y = h + 4;
        }
        window.requestAnimationFrame(draw);
      }
    }

    resize();
    draw();
    window.addEventListener("resize", function () {
      resize();
      if (reduce) draw();
    });
  }
})();
