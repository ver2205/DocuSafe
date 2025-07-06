const webpush = require('web-push');

const endpoint =
  'https://fcm.googleapis.com/fcm/send/dfTGqDrIxpo:APA91bFTaPpqSxoe6W_wjbUHqXlLdTmR_yn0kFU7fVHP7xFO8nbzb92k6xKM8mB93o3UuFwt55DdTQwTcU7dpt6fPNL--W-eqW1JhDRKGutYyhhEGWAV9611NCE7AlnnJKaOiXuXrGe3';

const keys = {
  auth: 'J0liifBJj-xSHayqROTEdg',
  p256dh:
    'BGqr2-kfCHj3gDJ41TWa3hHNBoJF6qFfqC71untwtXGgnP9zkfgE-qewQRjUXyjoXjiAQKMuat1Frk9-YXzaycU',
};

webpush.setVapidDetails(
  'mailto:test@example.com',
  'BErjvu2j3Y0JRptKgbGEhy32aYgjYdC0MkwFtryCINhyDczAQfGG6R4TBT643IS1JVM_fnr1SV9CxeHl6MhCdiI',
  '9pIPcRIR_BEe7c2O11A34Y0cLstidorcSwIHLUnJ1ZY'
);

const payload = JSON.stringify({
  title: 'Direct PUSH test',
  body: 'Tole je poslano direktno iz node!',
});

webpush
  .sendNotification({ endpoint, keys }, payload)
  .then(() => console.log('Push uspešno poslan!'))
  .catch((err) => console.error(' Napaka pri push:', err));
