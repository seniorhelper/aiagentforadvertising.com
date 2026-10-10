/* aiagentforadvertising.com: calculator, gallery filter, lead form. No libraries. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- hours calculator ---- */
  var calc = $('#hours-calc');
  if (calc) {
    var fmt = function (n, d) { return n.toLocaleString('en-US', { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); };
    var num = function (el) { var v = parseFloat(el.value); return isFinite(v) && v > 0 ? v : 0; };
    var run = function () {
      var total = 0;
      $$('[data-task]', calc).forEach(function (el) { total += Math.min(num(el), 80); });
      var share = num($('#c-share')) / 100;
      var weeks = Math.min(num($('#c-weeks')), 52);
      var rate = num($('#c-rate'));
      var prep = total * share;
      $('#o-total').textContent = fmt(total, 1);
      $('#o-prep').textContent = fmt(prep, 1);
      $('#o-year').textContent = fmt(prep * weeks);
      $('#o-value').textContent = rate ? '$' + fmt(prep * weeks * rate) : 'add your hourly value';
      $('#o-share').textContent = fmt(share * 100);
      $('#o-weeks').textContent = fmt(weeks);
    };
    calc.addEventListener('input', run);
    calc.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    run();
  }

  /* ---- example gallery filter ---- */
  var gal = $('#gallery');
  if (gal) {
    var bar = $('#filters');
    bar.hidden = false;
    var state = { platform: 'all', job: 'all' };
    var cards = $$('.agent', gal);
    var count = $('#fcount');
    var apply = function () {
      var shown = 0;
      cards.forEach(function (c) {
        var okP = state.platform === 'all' || (' ' + c.dataset.platform + ' ').indexOf(' ' + state.platform + ' ') > -1;
        var okJ = state.job === 'all' || (' ' + c.dataset.job + ' ').indexOf(' ' + state.job + ' ') > -1;
        c.hidden = !(okP && okJ);
        if (okP && okJ) shown++;
      });
      count.textContent = shown + ' of ' + cards.length + ' example agents shown';
    };
    $$('.fbtn', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.dataset.group;
        state[g] = b.dataset.value;
        $$('.fbtn[data-group="' + g + '"]', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        apply();
      });
    });
    apply();
  }

  /* ---- lead form (FormSubmit AJAX) ---- */
  var form = $('#lead-form');
  if (form) {
    var ok = $('#form-ok'), err = $('#form-err'), btn = $('button[type=submit]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ok.hidden = true; err.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      $$('input,textarea,select', form).forEach(function (el) {
        if (!el.name || el.type === 'checkbox') return;
        data[el.name] = el.value;
      });
      data.ad_platforms = $$('input[name="ad_platforms"]:checked', form).map(function (c) { return c.value; }).join(', ') || 'None selected';
      btn.disabled = true;
      var old = btn.textContent; btn.textContent = 'Sending...';
      fetch(form.dataset.ajax, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) !== 'false') {
            ok.hidden = false; form.reset(); ok.focus();
          } else { throw new Error('rejected'); }
        })
        .catch(function () { err.hidden = false; err.focus(); })
        .then(function () { btn.disabled = false; btn.textContent = old; });
    });
  }
})();
