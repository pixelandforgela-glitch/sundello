/* Origin 320 customizer. SALES_EMAIL stays empty on purpose, same as /app.js. */
(function () {
  const SALES_EMAIL = '';
  const STORAGE_KEY = 'sundello-origin-320';
  const STEPS = [
    { id: 'roof', label: 'Roof' },
    { id: 'layout', label: 'Layout' },
    { id: 'collection', label: 'Collection' },
    { id: 'finishes', label: 'Finishes' },
    { id: 'summary', label: 'Summary' }
  ];
  const VIEW_IDS = ['front', 'side', 'sw', 'rear'];

  const stepsEl = document.querySelector('#cz-steps');
  const heroEl = document.querySelector('#cz-hero');
  const panelEl = document.querySelector('#cz-panel');
  const liveEl = document.querySelector('#cz-live');
  if (!stepsEl || !heroEl || !panelEl) return;

  let data = null;
  let state = {
    roof: 'gable',
    layout: 'studio',
    collection: '',
    view: 'front',
    picks: {},
    step: 'roof'
  };

  stepsEl.addEventListener('click', function (event) {
    const button = event.target.closest('[data-step]');
    if (!button || button.disabled) return;
    state.step = button.dataset.step;
    render({ focusHeading: true, announce: true });
  });

  panelEl.addEventListener('change', function (event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.form && input.form.id === 'quote-form') return;
    if (input.name === 'roof') state.roof = input.value;
    if (input.name === 'layout') state.layout = input.value;
    if (input.name === 'view') state.view = input.value;
    if (input.name === 'collection') {
      state.collection = input.value;
      state.view = 'front';
      state.picks = {};
      ensurePicks();
    }
    if (input.dataset.key) state.picks[input.dataset.key] = input.value;
    render({ keepFocus: input.dataset.focus || '' });
  });

  panelEl.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-next')) {
      const index = stepIndex();
      if (STEPS[index].id === 'collection' && !state.collection) {
        announce('Choose a collection to continue.');
        return;
      }
      state.step = STEPS[Math.min(STEPS.length - 1, index + 1)].id;
      render({ focusHeading: true, announce: true });
    }
    if (button.hasAttribute('data-back')) {
      const index = stepIndex();
      state.step = STEPS[Math.max(0, index - 1)].id;
      render({ focusHeading: true, announce: true });
    }
    if (button.hasAttribute('data-copy-link')) copyLink();
    if (button.hasAttribute('data-copy-inquiry')) copyInquiry();
  });

  panelEl.addEventListener('submit', function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'quote-form') return;
    event.preventDefault();
    submitQuote(form);
  });

  fetch('data.json')
    .then(function (response) {
      if (!response.ok) throw new Error('load');
      return response.json();
    })
    .then(function (json) {
      data = json;
      hydrate();
      render({ announce: false });
    })
    .catch(function () {
      panelEl.innerHTML = '<p>The customizer did not load. Refresh the page to try again.</p>';
    });

  function hydrate() {
    const fromHash = readHash();
    const saved = fromHash ? null : readStorage();
    const source = fromHash || saved;
    if (source) {
      if (source.roof) state.roof = source.roof;
      if (source.layout) state.layout = source.layout;
      if (typeof source.collection === 'string') state.collection = source.collection;
      if (source.view) state.view = source.view;
      if (source.step) state.step = source.step;
      if (source.picks) state.picks = Object.assign({}, source.picks);
    }
    if (!roof()) state.roof = 'gable';
    if (!layout()) state.layout = 'studio';
    if (state.collection && !collection()) state.collection = '';
    if (!STEPS.some(function (step) { return step.id === state.step; })) state.step = 'roof';
    if ((state.step === 'finishes' || state.step === 'summary') && !state.collection) state.step = 'collection';
    if (VIEW_IDS.indexOf(state.view) === -1) state.view = 'front';
    ensurePicks();
  }

  function roof() {
    return (data.roofs || []).find(function (item) { return item.id === state.roof; }) || null;
  }

  function layout() {
    return (data.layouts || []).find(function (item) { return item.id === state.layout; }) || null;
  }

  function collection() {
    return (data.collections || []).find(function (item) { return item.id === state.collection; }) || null;
  }

  function shownCollection() {
    return collection() || (data.collections || [])[0] || null;
  }

  function finishGroups() {
    const current = collection();
    if (!current) return [];
    const list = [];
    function push(categories, shared) {
      (categories || []).forEach(function (category) {
        (category.groups || []).forEach(function (group) {
          const key = group.id === 'main' ? category.id : category.id + '__' + group.id;
          list.push({ key: key, category: category, group: group, shared: shared });
        });
      });
    }
    push(data.finishes[current.id] || [], false);
    push(data.sharedFinishes || [], true);
    return list;
  }

  function ensurePicks() {
    if (!collection()) {
      state.picks = {};
      return;
    }
    const next = {};
    finishGroups().forEach(function (group) {
      const ids = group.group.choices.map(function (choice) { return choice.id; });
      const current = state.picks[group.key];
      next[group.key] = ids.indexOf(current) !== -1 ? current : ids[0];
    });
    state.picks = next;
  }

  function stepIndex() {
    const index = STEPS.findIndex(function (step) { return step.id === state.step; });
    return index === -1 ? 0 : index;
  }

  function canOpen(id) {
    if ((id === 'finishes' || id === 'summary') && !state.collection) return false;
    return true;
  }

  function render(options) {
    options = options || {};
    ensurePicks();
    writeHash();
    writeStorage();
    renderSteps();
    renderHero();
    renderPanel();
    if (options.keepFocus) {
      const target = panelEl.querySelector('[data-focus="' + cssEscape(options.keepFocus) + '"]');
      if (target) target.focus();
    } else if (options.focusHeading) {
      const heading = document.getElementById('cz-heading');
      if (heading) heading.focus();
    }
    if (options.announce) announce(STEPS[stepIndex()].label);
  }

  function renderSteps() {
    stepsEl.innerHTML = STEPS.map(function (step, index) {
      const current = step.id === state.step;
      const disabled = !canOpen(step.id);
      return '<li><button type="button" data-step="' + esc(step.id) + '"' +
        (current ? ' aria-current="step"' : '') +
        (disabled ? ' disabled' : '') +
        '>0' + (index + 1) + ' ' + esc(step.label) + '</button></li>';
    }).join('');
  }

  function renderHero() {
    const current = shownCollection();
    if (!current) {
      heroEl.innerHTML = '';
      return;
    }
    const roofId = state.roof === 'flat' ? 'flat' : 'gable';
    const views = roofId === 'gable' && current.images.gableViews ? current.images.gableViews : null;
    let image = current.images[roofId];
    let viewIndex = 0;
    if (views) {
      viewIndex = Math.max(0, VIEW_IDS.indexOf(state.view));
      if (viewIndex >= views.length) viewIndex = 0;
      image = views[viewIndex];
    }
    const example = !collection();
    const caption = example
      ? esc(current.name) + ' is shown until you choose a collection.'
      : esc(image.alt);
    const srcset = image.srcSmall
      ? ' srcset="' + esc(image.srcSmall) + ' 800w, ' + esc(image.src) + ' ' + image.width + 'w" sizes="(min-width: 960px) 42vw, 100vw"'
      : '';
    let viewsHtml = '';
    if (views && views.length > 1) {
      viewsHtml = '<div class="cz-views" role="radiogroup" aria-label="Exterior view">' +
        views.map(function (view, index) {
          const id = VIEW_IDS[index] || ('view-' + index);
          const checked = index === viewIndex ? ' checked' : '';
          return '<label><input type="radio" name="view" value="' + esc(id) + '" data-focus="view-' + esc(id) + '"' + checked + '> ' +
            esc(viewLabel(id)) + '</label>';
        }).join('') + '</div>';
    }
    heroEl.innerHTML =
      '<img src="' + esc(image.src) + '"' + srcset +
      ' width="' + image.width + '" height="' + image.height + '" alt="' + esc(image.alt) + '">' +
      '<figcaption><span>' + esc(current.name) + '</span><span>' + esc(roof() ? roof().name : '') + '</span></figcaption>' +
      viewsHtml +
      (example ? '<p class="origin-note" style="padding:0 14px 14px;margin:0">' + caption + '</p>' : '');
  }

  function viewLabel(id) {
    if (id === 'side') return 'Front side';
    if (id === 'sw') return 'Front southwest';
    if (id === 'rear') return 'Rear northwest';
    return 'Front';
  }

  function renderPanel() {
    const step = state.step;
    let body = '';
    if (step === 'roof') body = renderRoof();
    else if (step === 'layout') body = renderLayout();
    else if (step === 'collection') body = renderCollections();
    else if (step === 'finishes') body = renderFinishes();
    else body = renderSummary();
    const index = stepIndex();
    const nextDisabled = step === 'collection' && !state.collection ? ' disabled' : '';
    const actions = '<div class="cz-actions">' +
      (index > 0 ? '<button type="button" class="button button-paper" data-back>Back</button>' : '') +
      (index < STEPS.length - 1 ? '<button type="button" class="button button-ink" data-next' + nextDisabled + '>Next</button>' : '') +
      '</div>' + shareBlock();
    panelEl.innerHTML = body + actions;
    const share = panelEl.querySelector('#share-url');
    if (share) share.value = location.href;
  }

  function renderRoof() {
    return '<h2 id="cz-heading" tabindex="-1">Choose a roof</h2>' +
      '<p>Both roofs share the floor plan and the finish options.</p>' +
      '<div class="cz-choices" role="radiogroup" aria-labelledby="cz-heading">' +
      data.roofs.map(function (item) {
        return choiceHtml('roof', item.id, item.name, item.description, state.roof === item.id);
      }).join('') + '</div>';
  }

  function renderLayout() {
    return '<h2 id="cz-heading" tabindex="-1">Choose a layout</h2>' +
      '<p>The shell stays the same. The home-office layout is optional.</p>' +
      '<div class="cz-choices" role="radiogroup" aria-labelledby="cz-heading">' +
      data.layouts.map(function (item) {
        return choiceHtml('layout', item.id, item.name, item.description, state.layout === item.id);
      }).join('') + '</div>';
  }

  function renderCollections() {
    return '<h2 id="cz-heading" tabindex="-1">Choose a collection</h2>' +
      '<p>Five regional collections. Each one can be built with either roof.</p>' +
      '<div class="cz-cards" role="radiogroup" aria-labelledby="cz-heading">' +
      data.collections.map(function (item) {
        const checked = state.collection === item.id ? ' checked' : '';
        const thumb = item.images.gable;
        return '<label class="cz-card"><input type="radio" name="collection" value="' + esc(item.id) + '" data-focus="collection-' + esc(item.id) + '"' + checked + '>' +
          '<img src="' + esc(thumb.src) + '" width="' + thumb.width + '" height="' + thumb.height + '" alt="">' +
          '<span><b>' + esc(item.name) + '</b><small class="cz-detail">' + esc(item.tagline) + '</small></span></label>';
      }).join('') + '</div>';
  }

  function renderFinishes() {
    const current = collection();
    if (!current) return '<h2 id="cz-heading" tabindex="-1">Finishes</h2><p>Choose a collection first.</p>';
    const groups = finishGroups();
    let sharedStarted = false;
    let collectionStarted = false;
    let html = '<h2 id="cz-heading" tabindex="-1">' + esc(current.name) + ' finishes</h2>' +
      '<p>' + esc(current.description) + '</p>' +
      '<p class="cz-price">' + esc(data.price) + '</p>' +
      '<p>Signature is included. An upgrade is priced in your quote. There is no separate price for each finish.</p>';
    groups.forEach(function (group) {
      if (!group.shared && !collectionStarted) {
        html += '<p class="cz-block-label">This collection</p>';
        collectionStarted = true;
      }
      if (group.shared && !sharedStarted) {
        html += '<p class="cz-block-label">In every Origin 320</p>';
        sharedStarted = true;
      }
      html += finishGroupHtml(group);
    });
    return html;
  }

  function finishGroupHtml(group) {
    const choices = group.group.choices;
    const label = group.group.id === 'main' ? group.category.name : group.category.name + ', ' + group.group.label;
    let inner = '';
    if (choices.length === 1 && choices[0].id === 'team') {
      inner = '<p class="cz-team">Selected with your Sundello team</p>';
    } else if (choices.length === 1) {
      inner = '<p class="cz-team"><span class="cz-tier">' + esc(tierLabel(choices[0].tier)) + '</span> ' +
        esc(choices[0].name) + (choices[0].detail ? '<span class="cz-detail">' + esc(choices[0].detail) + '</span>' : '') + '</p>';
    } else {
      inner = '<div class="cz-pick" role="radiogroup" aria-label="' + esc(label) + '">' +
        choices.map(function (choice) {
          const selected = state.picks[group.key] === choice.id;
          return pickHtml(group.key, choice, selected);
        }).join('') + '</div>';
    }
    const scope = group.group.id === 'main' && group.category.scope
      ? '<p class="cz-scope">' + esc(group.category.scope) + '</p>'
      : '';
    return '<section class="cz-finish"><h3>' + esc(label) + '</h3>' + scope + inner + '</section>';
  }

  function renderSummary() {
    const current = collection();
    const rows = [
      row('Price', data.price),
      row('Structure', data.structure),
      row('Roof', roof() ? roof().name : ''),
      row('Layout', layout() ? layout().name : ''),
      row('Collection', current ? current.name : 'Not selected')
    ];
    finishGroups().forEach(function (group) {
      const choice = group.group.choices.find(function (item) { return item.id === state.picks[group.key]; });
      if (!choice) return;
      const label = group.group.id === 'main' ? group.category.name : group.category.name + ', ' + group.group.label;
      let value = choice.name;
      if (choice.tier === 'Upgrade') value += ' — priced in your quote';
      else if (choice.tier === 'Alternate' || choice.tier === 'Signature') value += ' (' + choice.tier + ')';
      rows.push(row(label, value));
    });
    return '<h2 id="cz-heading" tabindex="-1">Your Origin 320</h2>' +
      '<p>Review the build, then request a quote. The price line does not change with finishes.</p>' +
      '<dl class="cz-summary">' + rows.join('') + '</dl>' +
      quoteForm();
  }

  function quoteForm() {
    return '<form class="cz-form" id="quote-form" novalidate>' +
      '<h3>Request a quote</h3>' +
      '<p>Your selections are included with this note. Name, email, and ZIP are required.</p>' +
      '<label for="quote-name">Name</label>' +
      '<input id="quote-name" name="name" autocomplete="name" required maxlength="120">' +
      '<label for="quote-email">Email</label>' +
      '<input id="quote-email" name="email" type="email" autocomplete="email" required maxlength="160">' +
      '<label for="quote-phone">Phone <span class="req">(optional)</span></label>' +
      '<input id="quote-phone" name="phone" type="tel" autocomplete="tel" maxlength="40">' +
      '<label for="quote-zip">ZIP</label>' +
      '<input id="quote-zip" name="zip" autocomplete="postal-code" required maxlength="12" inputmode="text">' +
      '<label for="quote-notes">Notes <span class="req">(optional)</span></label>' +
      '<textarea id="quote-notes" name="notes" maxlength="2000"></textarea>' +
      '<button type="submit" class="button button-ink">Request a quote</button>' +
      '<p id="quote-status" class="cz-status" role="status"></p>' +
      '<button type="button" class="button button-paper" data-copy-inquiry>Copy inquiry</button>' +
      '</form>';
  }

  function shareBlock() {
    return '<div class="cz-share"><label for="share-url">Shareable link</label>' +
      '<div class="cz-share-row"><input id="share-url" readonly value="">' +
      '<button type="button" class="button button-paper" data-copy-link>Copy link</button></div></div>';
  }

  function choiceHtml(name, id, title, detail, checked) {
    return '<label class="cz-choice"><input type="radio" name="' + esc(name) + '" value="' + esc(id) + '" data-focus="' + esc(name + '-' + id) + '"' +
      (checked ? ' checked' : '') + '><span><strong>' + esc(title) + '</strong>' +
      (detail ? '<small>' + esc(detail) + '</small>' : '') + '</span></label>';
  }

  function pickHtml(key, choice, selected) {
    const note = choice.tier === 'Upgrade' ? '<span class="cz-quote-note">priced in your quote</span>' : '';
    return '<label class="cz-choice"><input type="radio" name="pick-' + esc(key) + '" value="' + esc(choice.id) + '" data-key="' + esc(key) + '" data-focus="pick-' + esc(key + '-' + choice.id) + '"' +
      (selected ? ' checked' : '') + '><span><span class="cz-tier">' + esc(tierLabel(choice.tier)) + '</span>' + note + '<strong>' + esc(choice.name) + '</strong>' +
      (choice.detail ? '<small>' + esc(choice.detail) + '</small>' : '') + '</span></label>';
  }

  function tierLabel(tier) {
    if (tier === 'Team') return 'Included';
    return tier;
  }

  function row(label, value) {
    return '<div><dt>' + esc(label) + '</dt><dd>' + esc(value) + '</dd></div>';
  }

  function inquiryBody(fields) {
    const lines = [
      'Hello Sundello,',
      '',
      'I am interested in the Origin 320.',
      data.price,
      '',
      'Roof: ' + (roof() ? roof().name : ''),
      'Layout: ' + (layout() ? layout().name : ''),
      'Collection: ' + (collection() ? collection().name : 'Not selected'),
      'Structure: ' + data.structure,
      'Finishes:'
    ];
    finishGroups().forEach(function (group) {
      const choice = group.group.choices.find(function (item) { return item.id === state.picks[group.key]; });
      if (!choice) return;
      let label = group.category.name;
      if (group.group.id !== 'main') label += ' (' + group.group.label + ')';
      let line = '- ' + label + ': ' + choice.name;
      if (choice.tier === 'Upgrade') line += ' (Upgrade, priced in your quote)';
      else if (choice.tier !== 'Team') line += ' (' + choice.tier + ')';
      lines.push(line);
    });
    lines.push(
      '',
      'Name: ' + (fields.name || ''),
      'Email: ' + (fields.email || ''),
      'Phone: ' + (fields.phone || ''),
      'ZIP: ' + (fields.zip || ''),
      'Notes: ' + (fields.notes || ''),
      '',
      'Shareable link: ' + location.href
    );
    return lines.join('\n');
  }

  function formFields(form) {
    const data = new FormData(form);
    return {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      zip: String(data.get('zip') || '').trim(),
      notes: String(data.get('notes') || '').trim()
    };
  }

  function submitQuote(form) {
    const fields = formFields(form);
    const email = form.querySelector('#quote-email');
    let invalid = null;
    ['quote-name', 'quote-email', 'quote-zip'].forEach(function (id) {
      const input = form.querySelector('#' + id);
      const value = input.value.trim();
      const ok = value && (id !== 'quote-email' || email.checkValidity());
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !invalid) invalid = input;
    });
    if (invalid) {
      invalid.focus();
      setStatus('Add your name, email, and ZIP to request a quote.');
      return;
    }
    const body = inquiryBody(fields);
    const subject = 'Origin 320 project inquiry';
    if (SALES_EMAIL) {
      window.location.href = 'mailto:' + SALES_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      setStatus('Your email app will open with this Origin 320 build included.');
      return;
    }
    showInquiry(body);
    copyText(body).then(function (ok) {
      setStatus(ok
        ? 'A sales address is not connected yet, same as the Origin page, so this note was not emailed. The inquiry is copied, including your selections.'
        : 'A sales address is not connected yet, same as the Origin page, so this note was not emailed. Copy the inquiry below. It includes your selections.');
    });
  }

  function copyInquiry() {
    const form = document.getElementById('quote-form');
    if (!form) return;
    const body = inquiryBody(formFields(form));
    showInquiry(body);
    copyText(body).then(function (ok) {
      setStatus(ok ? 'Inquiry copied.' : 'Select the inquiry text below to copy it.');
    });
  }

  function showInquiry(body) {
    let box = document.getElementById('quote-inquiry');
    if (!box) {
      box = document.createElement('textarea');
      box.id = 'quote-inquiry';
      box.className = 'cz-inquiry';
      box.readOnly = true;
      box.setAttribute('aria-label', 'Inquiry text');
      const status = document.getElementById('quote-status');
      if (status) status.insertAdjacentElement('afterend', box);
    }
    box.value = body;
  }

  function setStatus(message) {
    const status = document.getElementById('quote-status');
    if (status) status.textContent = message;
    announce(message);
  }

  function copyLink() {
    writeHash();
    const input = document.getElementById('share-url');
    if (input) input.value = location.href;
    copyText(location.href).then(function (ok) {
      announce(ok ? 'Link copied.' : 'Select the shareable link to copy it.');
      if (!ok && input) input.focus();
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
    }
    return Promise.resolve(false);
  }

  function writeHash() {
    const params = new URLSearchParams();
    params.set('roof', state.roof);
    params.set('layout', state.layout);
    if (state.collection) params.set('collection', state.collection);
    if (state.view && state.view !== 'front') params.set('view', state.view);
    params.set('step', state.step);
    const picks = [];
    if (state.collection) {
      finishGroups().forEach(function (group) {
        const fallback = group.group.choices[0] && group.group.choices[0].id;
        const value = state.picks[group.key];
        if (value && value !== fallback) picks.push(group.key + ':' + value);
      });
    }
    if (picks.length) params.set('picks', picks.join(','));
    const next = '#' + params.toString();
    if (location.hash !== next) history.replaceState(null, '', next);
  }

  function readHash() {
    if (!location.hash || location.hash.length < 2) return null;
    const params = new URLSearchParams(location.hash.slice(1));
    if (![...params.keys()].length) return null;
    const picks = {};
    const raw = params.get('picks');
    if (raw) {
      raw.split(',').forEach(function (pair) {
        const index = pair.indexOf(':');
        if (index > 0) picks[pair.slice(0, index)] = pair.slice(index + 1);
      });
    }
    return {
      roof: params.get('roof') || '',
      layout: params.get('layout') || '',
      collection: params.get('collection') || '',
      view: params.get('view') || 'front',
      step: params.get('step') || '',
      picks: picks
    };
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function writeStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        roof: state.roof,
        layout: state.layout,
        collection: state.collection,
        view: state.view,
        step: state.step,
        picks: state.picks
      }));
    } catch (error) {
      /* Storage can be blocked. The share link still keeps the build. */
    }
  }

  function announce(message) {
    if (liveEl) liveEl.textContent = message;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }
})();
