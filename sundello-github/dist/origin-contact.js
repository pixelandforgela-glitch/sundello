/* Origin #contact quote form. SALES_EMAIL matches /app.js and the customizer. */
(function () {
  const SALES_EMAIL = 'todd.ellis@gbs-usa.build';
  const form = document.getElementById('origin-quote');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const fields = readFields();
    if (!fields) return;
    compose(fields).then(function (pack) {
      window.location.href = 'mailto:' + SALES_EMAIL + '?subject=' + encodeURIComponent(pack.subject) + '&body=' + encodeURIComponent(pack.body);
      setStatus('Your email app will open a message to ' + SALES_EMAIL + '. If it does not, use Copy inquiry.');
    });
  });

  document.getElementById('origin-copy').addEventListener('click', function () {
    const fields = readFields() || blankFields();
    compose(fields).then(function (pack) {
      const text = 'To: ' + SALES_EMAIL + '\nSubject: ' + pack.subject + '\n\n' + pack.body;
      showInquiry(text);
      copyText(text).then(function (ok) {
        setStatus(ok ? 'Inquiry copied.' : 'Select the inquiry text below to copy it.');
      });
    });
  });

  function readFields() {
    const email = form.querySelector('#origin-email');
    let invalid = null;
    ['origin-name', 'origin-email', 'origin-zip'].forEach(function (id) {
      const input = form.querySelector('#' + id);
      const value = input.value.trim();
      const ok = value && (id !== 'origin-email' || email.checkValidity());
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !invalid) invalid = input;
    });
    if (invalid) {
      invalid.focus();
      setStatus('Add your name, email, and ZIP to request a quote.');
      return null;
    }
    return fieldsFromForm();
  }

  function blankFields() {
    return fieldsFromForm();
  }

  function fieldsFromForm() {
    const data = new FormData(form);
    return {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      zip: String(data.get('zip') || '').trim(),
      notes: String(data.get('notes') || '').trim()
    };
  }

  function compose(fields) {
    const saved = readStorage();
    return fetch('/origin/customize/data.json')
      .then(function (response) { return response.ok ? response.json() : null; })
      .catch(function () { return null; })
      .then(function (data) { return pack(data, saved, fields); });
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem('sundello-origin-320');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function pack(data, saved, fields) {
    const roofItem = data && saved ? find(data.roofs, saved.roof) : null;
    const layoutItem = data && saved ? find(data.layouts, saved.layout) : null;
    const collectionItem = data && saved ? find(data.collections, saved.collection) : null;
    const roofName = roofItem ? roofItem.name : 'Not selected';
    const layoutName = layoutItem ? layoutItem.name : 'Not selected';
    const collectionName = collectionItem ? collectionItem.name : 'Not selected';
    const named = roofItem && layoutItem && collectionItem;
    const subject = named
      ? 'Origin quote request - ' + collectionName + ', ' + roofName + ', ' + layoutName
      : 'Origin quote request';
    const lines = [
      'Hello Sundello,',
      '',
      'I am interested in the Origin 320.',
      data && data.price ? data.price : 'Starting at $99,000 plus site work and permits',
      '',
      'Roof: ' + roofName,
      'Layout: ' + layoutName,
      'Collection: ' + collectionName
    ];
    if (data && data.structure) lines.push('Structure: ' + data.structure);
    const finishes = finishLines(data, saved);
    if (finishes.length) {
      lines.push('Finishes:');
      finishes.forEach(function (line) { lines.push(line); });
    }
    lines.push(
      '',
      'Name: ' + (fields.name || ''),
      'Email: ' + (fields.email || ''),
      'Phone: ' + (fields.phone || ''),
      'ZIP: ' + (fields.zip || ''),
      'Notes: ' + (fields.notes || ''),
      '',
      'Shareable link: ' + shareUrl(saved)
    );
    return { subject: subject, body: lines.join('\n') };
  }

  function finishLines(data, saved) {
    if (!data || !saved || !saved.collection || !data.finishes || !data.finishes[saved.collection]) return [];
    const lines = [];
    const categories = data.finishes[saved.collection].concat(data.sharedFinishes || []);
    categories.forEach(function (category) {
      (category.groups || []).forEach(function (group) {
        const key = group.id === 'main' ? category.id : category.id + '__' + group.id;
        const picks = saved.picks || {};
        const fallback = group.choices && group.choices[0] ? group.choices[0].id : '';
        const choiceId = picks[key] || fallback;
        const choice = find(group.choices, choiceId);
        if (!choice) return;
        let label = category.name;
        if (group.id !== 'main') label += ' (' + group.label + ')';
        let line = '- ' + label + ': ' + choice.name;
        if (choice.tier === 'Upgrade') line += ' (Upgrade, priced in your quote)';
        else if (choice.tier !== 'Team') line += ' (' + choice.tier + ')';
        lines.push(line);
      });
    });
    return lines;
  }

  function shareUrl(saved) {
    const base = location.origin + '/origin/customize/';
    if (!saved) return base;
    const params = new URLSearchParams();
    if (saved.roof) params.set('roof', saved.roof);
    if (saved.layout) params.set('layout', saved.layout);
    if (saved.collection) params.set('collection', saved.collection);
    if (saved.view && saved.view !== 'front') params.set('view', saved.view);
    params.set('step', 'summary');
    const picks = saved.picks || {};
    const parts = Object.keys(picks).map(function (key) { return key + ':' + picks[key]; });
    if (parts.length) params.set('picks', parts.join(','));
    return base + '#' + params.toString();
  }

  function find(list, id) {
    return (list || []).find(function (item) { return item.id === id; }) || null;
  }

  function showInquiry(text) {
    let box = document.getElementById('origin-inquiry');
    if (!box) {
      box = document.createElement('textarea');
      box.id = 'origin-inquiry';
      box.className = 'cz-inquiry';
      box.readOnly = true;
      box.setAttribute('aria-label', 'Inquiry text');
      document.getElementById('origin-quote-status').insertAdjacentElement('afterend', box);
    }
    box.value = text;
  }

  function setStatus(message) {
    document.getElementById('origin-quote-status').textContent = message;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
    }
    return Promise.resolve(false);
  }
})();
