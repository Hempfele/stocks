const localHosts = new Set(['localhost', '127.0.0.1', '::1']);

if (localHosts.has(location.hostname)) {
  document.querySelectorAll('.play-link').forEach((link) => {
    link.href = 'http://localhost:8765/index.html?demo&seed';
  });
}
