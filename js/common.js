function showPrice(cents, period) {
  const dollars = (cents / 100).toLocaleString('en-CA');
  return `$${dollars} / ${period}`;
}

// keep database text safe
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
