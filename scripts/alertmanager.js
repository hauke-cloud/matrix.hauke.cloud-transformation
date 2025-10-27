// Hookshot JS Transform for Prometheus Alertmanager
// API: returns `result = { version: "v2", ... }`
// `data` is the Alertmanager webhook body.

(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const status = (data.status || "").toUpperCase();
  const receiver = data.receiver || "";
  const extURL = data.externalURL || "";
  const group = data.groupLabels || {};
  const commonAnno = data.commonAnnotations || {};
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];

  const sevEmoji = (sev) => {
    const s = (sev || "").toLowerCase();
    if (s === "critical" || s === "crit") return "🛑";
    if (s === "warning" || s === "warn") return "⚠️";
    if (s === "info" || s === "information") return "ℹ️";
    return "🔔";
  };

  const headerBits = [];
  if (group.alertname) headerBits.push(`alertname=<code>${esc(group.alertname)}</code>`);
  const countText = `${alerts.length} alert${alerts.length === 1 ? "" : "s"}`;
  const hdrPlain = [
    `Alertmanager ${status}: ${countText}`,
    receiver ? `receiver=${receiver}` : null,
    group.alertname ? `group.alertname=${group.alertname}` : null,
    commonAnno.summary ? `summary=${commonAnno.summary}` : null,
    extURL ? `externalURL=${extURL}` : null,
  ].filter(Boolean).join(" | ");

  const hdrHtml = [
    `<b>Alertmanager ${esc(status)}</b> · ${esc(countText)}`,
    receiver ? ` · <code>${esc(receiver)}</code>` : "",
    headerBits.length ? ` · ${headerBits.join(" ")}` : "",
    commonAnno.summary ? ` · ${esc(commonAnno.summary)}` : "",
    extURL ? ` · <a href="${esc(extURL)}">Alertmanager</a>` : "",
  ].join("");

  const linesPlain = [];
  const linesHtml = [];

  let anyCritical = false;

  for (const a of alerts) {
    const L = a.labels || {};
    const A = a.annotations || {};
    const sev = L.severity || "";
    if (String(sev).toLowerCase() === "critical" || String(sev).toLowerCase() === "crit") {
      anyCritical = true;
    }
    const when =
      (a.startsAt ? `starts: ${a.startsAt}` : "") +
      (a.endsAt ? ` ends: ${a.endsAt}` : "");
    const src = a.generatorURL || "";

    const subject =
      L.alertname || A.summary || A.title || "alert";

    // Pick a “target” hint (instance/pod/node/job)
    const target = L.instance || L.pod || L.node || L.host || L.job || "";

    // Compose plain
    linesPlain.push(
      `${sevEmoji(sev)} ${subject}${target ? ` on ${target}` : ""}` +
      (A.summary ? ` — ${A.summary}` : A.description ? ` — ${A.description}` : "") +
      (when ? ` (${when})` : "") +
      (src ? ` [source](${src})` : "")
    );

    // Compose HTML
    const htmlBits = [];
    htmlBits.push(`${sevEmoji(sev)} <code>${esc(subject)}</code>`);
    if (target) htmlBits.push(`on <code>${esc(target)}</code>`);
    if (A.summary || A.description) {
      htmlBits.push(`— ${esc(A.summary || A.description)}`);
    }
    if (when) htmlBits.push(` <span style="opacity:.8">(${esc(when)})</span>`);
    if (src) htmlBits.push(` <a href="${esc(src)}">source</a>`);

    // Select a few interesting labels to show inline; rest as tooltip
    const interesting = ["severity","instance","pod","job","namespace","service"];
    const shown = interesting.filter(k => L[k]).map(k => `<code>${esc(k)}=${esc(L[k])}</code>`);
    if (shown.length) {
      htmlBits.push(` · ${shown.join(" ")}`);
    }

    linesHtml.push(htmlBits.join(""));
  }

  const plain = [hdrPlain, ...linesPlain].join("\n");
  const html = [
    `<div>${hdrHtml}</div>`,
    `<ul>`,
    ...linesHtml.map(li => `<li>${li}</li>`),
    `</ul>`
  ].join("");

  const resultObj = {
    version: "v2",
    msgtype: "m.notice",
    plain,
    html,
  };

  // Mention the whole room on critical firings (remove if you don’t want this)
  if (anyCritical && (data.status || "").toLowerCase() === "firing") {
    resultObj.mentions = { room: true };
  }

  // Optional: tell Alertmanager we handled it
  resultObj.webhookResponse = {
    statusCode: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true })
  };

  result = resultObj;
})();
