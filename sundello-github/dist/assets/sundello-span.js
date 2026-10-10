/* Inject the Span chat bubble only when SPAN_BUSINESS_ID is set in sundello-config.js. */
(function () {
  var id = window.SPAN_BUSINESS_ID;
  if (typeof id !== "string" || !id.trim()) return;
  var base = String(window.SPAN_BASE || "https://span.scaffold.site").replace(/\/$/, "");
  var script = document.createElement("script");
  script.src = base + "/widget-loader.js";
  script.async = true;
  script.setAttribute("data-business-id", id.trim());
  script.setAttribute("data-mode", "bubble");
  script.setAttribute("data-position", "bottom-right");
  document.head.appendChild(script);
})();
