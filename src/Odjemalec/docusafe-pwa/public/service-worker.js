self.addEventListener('push', (event) => {
  console.log('[SW]  PUSH event!');

  let data = {
    title: ' Opomnik',
    body: ' Brez vsebine.',
  };

  try {
    const parsed = event.data?.json();
    data.title = parsed?.title || data.title;
    data.body = parsed?.body || data.body;
    console.log('[SW]  Prejeto:', parsed);
  } catch (err) {
    console.warn('[SW]  Neveljaven JSON:', event.data?.text());
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/test-icon.png',
      badge: '/test-icon.png',
      requireInteraction: true,
    })
  );
});
