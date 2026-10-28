(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var reduce = false;
  var seen = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    seen = sessionStorage.getItem("ao-intro") === "1";
  } catch (err) {
    seen = true;
  }

  if (reduce || seen) {
    root.classList.add("no-intro");
    return;
  }

  try {
    sessionStorage.setItem("ao-intro", "1");
  } catch (err) {}

  function boot() {
    var layer = document.querySelector(".intro");
    if (!layer) return;
    var canvas = layer.querySelector("canvas");
    var nameEl = layer.querySelector(".intro-name");
    if (!canvas || !canvas.getContext || !nameEl) {
      layer.remove();
      return;
    }

    var ctx = canvas.getContext("2d");
    var word = "[BLACK-OPS]";
    var glyphs = "AO#+*/";
    var count = 72;
    var targets = hydraTargets(count);
    var bits = [];
    var width = 0;
    var height = 0;
    var dpr = 1;
    var raf = 0;
    var started = 0;
    var closed = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function place() {
      bits = [];
      for (var i = 0; i < count; i++) {
        bits.push({
          x: Math.random() * width,
          y: Math.random() * height,
          sx: Math.random() * width,
          sy: Math.random() * height,
          tx: width * 0.5 + targets[i][0] * Math.min(width, height) * 0.28,
          ty: height * 0.46 + targets[i][1] * Math.min(width, height) * 0.28
        });
      }
    }

    function ease(v) {
      return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2;
    }

    function paintName(progress) {
      var shown = Math.max(0, Math.min(word.length, Math.floor((progress - 0.62) / 0.28 * word.length)));
      var out = word.slice(0, shown);
      var tick = Math.floor(progress * 24);
      for (var i = shown; i < word.length; i++) {
        var ch = word.charAt(i);
        out += (ch === " " || ch === "[" || ch === "]") ? ch : glyphs.charAt((i + tick) % glyphs.length);
      }
      nameEl.textContent = progress > 0.92 ? word : out;
    }

    function frame(now) {
      if (!started) started = now;
      var t = Math.min(1, (now - started) / 2000);
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < bits.length; i++) {
        var bit = bits[i];
        var x;
        var y;
        if (t < 0.28) {
          var rush = t / 0.28;
          x = bit.sx + (width * 0.5 - bit.sx) * rush * 0.35;
          y = bit.sy + (height * 0.46 - bit.sy) * rush;
          ctx.strokeStyle = "rgba(225,29,72,0.45)";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - (width * 0.5 - x) * 0.18, y);
          ctx.stroke();
        } else {
          var gather = ease(Math.min(1, (t - 0.28) / 0.42));
          x = bit.sx + (bit.tx - bit.sx) * gather;
          y = bit.sy + (bit.ty - bit.sy) * gather;
        }
        ctx.fillStyle = i % 5 === 0 ? "#c084fc" : "#e11d48";
        ctx.fillRect(x, y, 2, 2);
      }

      if (t > 0.62) paintName(t);
      if (t >= 1) finish();
      else raf = window.requestAnimationFrame(frame);
    }

    function finish() {
      if (closed) return;
      closed = true;
      window.cancelAnimationFrame(raf);
      nameEl.textContent = word;
      layer.classList.add("is-done");
      window.setTimeout(function () {
        layer.remove();
      }, 480);
      window.removeEventListener("keydown", skip);
      layer.removeEventListener("pointerdown", skip);
    }

    function skip(event) {
      if (event && event.key === "Tab") return;
      finish();
    }

    resize();
    place();
    window.addEventListener("resize", function () {
      resize();
      place();
    });
    window.addEventListener("keydown", skip);
    layer.addEventListener("pointerdown", skip);
    raf = window.requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function hydraTargets(total) {
    var pts = [];
    function ring(cx, cy, rx, ry, n) {
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
      }
    }
    ring(0, -0.46, 0.16, 0.22, 16);
    ring(-0.46, -0.06, 0.2, 0.13, 14);
    ring(0.46, -0.06, 0.2, 0.13, 14);
    pts.push([0, -0.78], [-0.12, -0.58], [0.12, -0.58]);
    for (var s = 0; s < 8; s++) {
      var u = s / 7;
      pts.push([0, -0.2 + u * 0.85]);
      pts.push([-0.12 + u * 0.12, -0.05 + u * 0.55]);
      pts.push([0.12 - u * 0.12, -0.05 + u * 0.55]);
    }
    var base = pts.length;
    while (pts.length < total) {
      var src = pts[pts.length % base];
      pts.push([src[0], src[1]]);
    }
    return pts.slice(0, total);
  }
})();
