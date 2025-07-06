const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID javni ključ:\n', vapidKeys.publicKey);
console.log('VAPID zasebni ključ:\n', vapidKeys.privateKey);
