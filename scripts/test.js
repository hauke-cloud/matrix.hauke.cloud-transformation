(function () {
  // Minimal v1/v2 compatible test
  const summary = `JS transform is RUNNING. ${
    typeof HookshotApiVersion === 'undefined' ? 'API=v1' : `API=${HookshotApiVersion}`
  }`;

  // Prefer v2 result if available
  if (typeof HookshotApiVersion !== 'undefined' && HookshotApiVersion === 'v2') {
    result = {
      version: "v2",
      msgtype: "m.notice",
      plain: summary,
      html: `<b>${summary}</b>`
    };
    return;
  }

  // v1 fallback: set a plain text result
  result = summary;
})();

