/* Outpost page: loads the site planner when it comes near the screen, and runs the contact form.
   Both send through SundelloLead (sundello-config.js) to the Span lead intake, which files the lead in Scaffold. */
(function () {
  var SALES_EMAIL = 'todd.ellis@gbs-usa.build';

  // ---------------------------------------------------------------- planner (three.js), loaded on demand
  var builder = document.getElementById('builder');
  var here = document.currentScript ? document.currentScript.src : location.href;
  var loaded = false;
  function loadBuilder() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.type = 'module';
    s.src = new URL('builder/build.js', here).href;
    s.onerror = function () {
      var panel = document.getElementById('sb-panel');
      if (panel) panel.innerHTML = '<p class="sb-hint">The site planner could not load. Use the form below to send your project.</p>';
    };
    document.body.appendChild(s);
  }
  if (builder) {
    if (/^#c=/.test(location.hash) || !('IntersectionObserver' in window)) {
      loadBuilder();
    } else {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); loadBuilder(); }
      }, { rootMargin: '600px 0px' });
      io.observe(builder);
    }
  }

  // ---------------------------------------------------------------- contact form
  var form = document.getElementById('outpost-contact');
  if (!form) return;
  var status = document.getElementById('op-status');
  var send = document.getElementById('op-send');

  function val(name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; }
  function setStatus(text) { status.textContent = text; }
  function mark(field) {
    ['name', 'email', 'phone', 'zip', 'notes'].forEach(function (k) {
      var el = form.elements[k]; if (el) el.setAttribute('aria-invalid', k === field ? 'true' : 'false');
    });
    return field && form.elements[field] ? form.elements[field] : null;
  }
  function fields() {
    var lines = ['Outpost page inquiry'];
    if (val('org')) lines.push('Organization: ' + val('org'));
    if (val('beds')) lines.push('Beds needed: ' + val('beds'));
    if (val('notes')) lines.push('', val('notes'));
    return {
      name: val('name'), email: val('email'), phone: val('phone'), zip: val('zip'),
      notes: lines.join('\n'), collection: 'Outpost', layout: val('beds') ? (val('beds') + ' beds').slice(0, 120) : '',
      roof: '', finishes: '', shareLink: '', company: form.elements.company ? form.elements.company.value : ''
    };
  }
  function fallback(f) {
    var text = 'To: ' + SALES_EMAIL + '\nSubject: Outpost inquiry - ' + f.name + '\n\n' + f.notes +
      '\n\nName: ' + f.name + '\nEmail: ' + f.email + '\nPhone: ' + f.phone + '\nProject ZIP: ' + f.zip;
    setStatus('We could not send this from here. Copy the inquiry below and email it to us.');
    var pre = form.querySelector('.op-inquiry');
    if (!pre) { pre = document.createElement('pre'); pre.className = 'op-inquiry'; form.appendChild(pre); }
    pre.textContent = text;
    var copy = form.querySelector('.op-copy');
    if (!copy) {
      copy = document.createElement('button'); copy.type = 'button'; copy.className = 'button button-paper op-copy'; copy.textContent = 'Copy inquiry';
      copy.addEventListener('click', function () {
        var done = function (ok) { setStatus(ok ? 'Inquiry copied.' : 'Select the inquiry text below to copy it.'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pre.textContent).then(function () { done(true); }, function () { done(false); });
        else done(false);
      });
      send.after(copy);
    }
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var f = fields();
    var L = window.SundelloLead;
    if (!L) { fallback(f); return; }
    var issue = L.problems(f);
    var bad = mark(issue ? issue.field : '');
    if (issue) { if (bad) bad.focus(); setStatus(issue.message); return; }
    var built = L.body(f);
    if (!built.ok) { setStatus(built.message); return; }
    if (form.dataset.sending === '1') return;
    form.dataset.sending = '1'; send.disabled = true; setStatus('Sending…');
    L.post(built.body).then(function (res) {
      form.dataset.sending = ''; send.disabled = false;
      if (res.ok) {
        form.innerHTML = '<p class="op-status op-wide" role="status">Thanks, ' + f.name.replace(/[<>&"]/g, '') + '. We have your note and will be in touch.</p>';
        return;
      }
      fallback(f);
    });
  });
})();
