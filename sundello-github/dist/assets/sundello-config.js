/* Shared Span settings. Leave SPAN_BUSINESS_ID empty until it should go live. */
var SPAN_BUSINESS_ID = "2d5ff86e-c52d-4a91-bed8-a57ec815ed59";
var SPAN_BASE = "https://span.scaffold.site";

var SundelloLead = (function () {
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE = /^[0-9+().\-\s]+$/;

  function enabled() {
    return typeof SPAN_BUSINESS_ID === "string" && SPAN_BUSINESS_ID.trim() !== "";
  }

  function text(value) {
    return value == null ? "" : String(value);
  }

  function problems(fields) {
    var name = text(fields.name).trim();
    var email = text(fields.email).trim();
    var phone = text(fields.phone).trim();
    var zip = text(fields.zip).trim();
    var notes = text(fields.notes).trim();

    if (!name) return { field: "name", message: "Add your name." };
    if (name.length > 120) return { field: "name", message: "Name must be 120 characters or fewer." };
    if (email && email.length > 200) return { field: "email", message: "Email must be 200 characters or fewer." };
    if (email && !EMAIL.test(email)) return { field: "email", message: "Enter a valid email." };
    if (phone && (phone.length < 7 || phone.length > 40 || !PHONE.test(phone) || !/\d/.test(phone))) {
      return { field: "phone", message: "Enter a phone number of 7 to 40 characters, with at least one digit. Digits, spaces, and + ( ) . - are fine." };
    }
    if (!email && !phone) return { field: "email", message: "Add an email or a phone number." };
    if (!/^[A-Za-z0-9 \-]{3,12}$/.test(zip)) {
      return { field: "zip", message: "Enter a ZIP of 3 to 12 letters, digits, spaces, or hyphens." };
    }
    if (notes.length > 2000) return { field: "notes", message: "Notes must be 2,000 characters or fewer." };
    return null;
  }

  function finishes(collectionName, upgradeCount) {
    var name = text(collectionName).trim() || "Origin";
    var count = parseInt(upgradeCount, 10);
    if (!isFinite(count) || count < 0) count = 0;
    var line = name + ", " + count + (count === 1 ? " upgrade" : " upgrades");
    return line.length > 120 ? line.slice(0, 120) : line;
  }

  function fitShare(value) {
    var url = text(value).trim();
    if (!/^https?:\/\//i.test(url)) return "";
    if (url.length <= 500) return url;
    var noHash = url.split("#")[0];
    if (noHash.length <= 500 && /^https?:\/\//i.test(noHash)) return noHash;
    var noQuery = url.split("?")[0];
    if (noQuery.length <= 500 && /^https?:\/\//i.test(noQuery)) return noQuery;
    return "";
  }

  function utf8Length(value) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value).length;
    return unescape(encodeURIComponent(value)).length;
  }

  function clip(value, max) {
    var out = text(value).trim();
    return out.length > max ? out.slice(0, max) : out;
  }

  function body(fields) {
    var issue = problems(fields);
    if (issue) return { ok: false, field: issue.field, message: issue.message };
    var payload = {
      name: clip(fields.name, 120),
      email: clip(fields.email, 200),
      phone: clip(fields.phone, 40),
      zip: clip(fields.zip, 12),
      notes: clip(fields.notes, 2000),
      collection: clip(fields.collection, 120),
      roof: clip(fields.roof, 120),
      layout: clip(fields.layout, 120),
      finishes: clip(fields.finishes, 120),
      shareLink: fitShare(fields.shareLink),
      company: text(fields.company)
    };
    var guard = 0;
    while (utf8Length(JSON.stringify(payload)) > 8000 && guard < 9000) {
      guard += 1;
      if (payload.company.length) {
        payload.company = payload.company.slice(0, payload.company.length - 1);
        continue;
      }
      if (payload.notes.length) {
        payload.notes = payload.notes.slice(0, payload.notes.length - 1);
        continue;
      }
      break;
    }
    if (utf8Length(JSON.stringify(payload)) > 8000) {
      return { ok: false, field: "notes", message: "Shorten the note and try again." };
    }
    return { ok: true, body: payload };
  }

  function post(payload) {
    if (!enabled() || typeof fetch !== "function") return Promise.resolve({ ok: false });
    var base = text(SPAN_BASE).replace(/\/$/, "") || "https://span.scaffold.site";
    var url = base + "/api/widget/intake?businessId=" + encodeURIComponent(SPAN_BUSINESS_ID.trim());
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.text().then(function (raw) {
        var data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch (error) { data = null; }
        var leadId = data && data.leadId;
        if (response.status === 200 && data && data.ok === true && leadId != null && String(leadId) !== "") {
          return { ok: true, leadId: leadId };
        }
        return { ok: false };
      });
    }).catch(function () {
      return { ok: false };
    });
  }

  return {
    enabled: enabled,
    problems: problems,
    finishes: finishes,
    body: body,
    post: post
  };
})();
