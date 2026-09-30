const esc = (s) => String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Telegram sozlanmagan' }) };
  }
  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ ok: false }) };
  }
  if (data.website) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }
  const name = String(data.name || '').trim().slice(0, 80);
  const phone = String(data.phone || '').trim().slice(0, 30);
  const digits = phone.replace(/\D/g, '').replace(/^998/, '');
  if (!name || digits.length < 9) {
    return { statusCode: 400, body: JSON.stringify({ ok: false }) };
  }
  const gift = data.gift === true;
  const total = 169000 + 30000 + (gift ? 30000 : 0);
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
  const text =
    '🛒 <b>Yangi buyurtma</b>\n\n' +
    '👤 Ism: <b>' + esc(name) + '</b>\n' +
    '📞 Tel: <b>' + esc(phone) + '</b>\n' +
    '⌚️ Mahsulot: Klassik kvars soat\n' +
    '🎁 Sovg‘a qutisi: ' + (gift ? 'Ha (+30 000)' : 'Yo‘q') + '\n' +
    '💰 Jami: <b>' + fmt(total) + ' so‘m</b>\n' +
    '🕒 ' + time;
  const res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!res.ok) {
    return { statusCode: 502, body: JSON.stringify({ ok: false }) };
  }
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

