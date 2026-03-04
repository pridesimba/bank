// Netlify Function: send form data to Telegram bot
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server misconfigured' }),
      };
    }

    const message = formatMessage(data);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram API error:', result);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Telegram API error' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

function formatMessage(d) {
  let msg = '';

  if (d.formType === 'credit') {
    // Credit application
    msg += '💳 <b>НОВАЯ ЗАЯВКА НА КРЕДИТ</b>\n';
    msg += '━━━━━━━━━━━━━━━━━━━━━\n\n';

    msg += '🎯 <b>Цель:</b> ' + (d.creditPurpose || '—') + '\n';
    msg += '💰 <b>Сумма:</b> ' + (d.creditAmount || '—') + '\n';
    msg += '📍 <b>Регион:</b> ' + (d.region || '—') + '\n';
    msg += '📊 <b>Вероятность одобрения:</b> ' + (d.approvalChance || '—') + '%\n';
  } else {
    // Refinancing application
    msg += '📋 <b>НОВАЯ ЗАЯВКА НА РЕФИНАНСИРОВАНИЕ</b>\n';
    msg += '━━━━━━━━━━━━━━━━━━━━━\n\n';

    msg += '💰 <b>Сумма:</b> ' + (d.loanAmount || '—') + '\n';
    msg += '💳 <b>Платёж/мес:</b> ' + (d.monthlyPayment || '—') + ' ₽\n';
    msg += '⏸ <b>Отсрочка:</b> ' + (d.deferral || '—') + '\n';
    msg += '🚗 <b>Автокредит:</b> ' + (d.autoLoan || '—') + '\n';

    if (d.property === 'Да') {
      msg += '🏠 <b>Имущество:</b> Да (' + (d.propertyCount || '—') + ')\n';
    } else {
      msg += '🏠 <b>Имущество:</b> Нет\n';
    }

    msg += '📍 <b>Регион:</b> ' + (d.region || '—') + '\n';
    msg += '📊 <b>Вероятность одобрения:</b> ' + (d.approvalChance || '—') + '%\n';
  }

  msg += '\n━━━━━━━━━━━━━━━━━━━━━\n\n';

  msg += '👤 <b>ФИО:</b> ' + (d.fullName || '—') + '\n';
  msg += '📱 <b>Телефон:</b> ' + (d.phone || '—') + '\n';
  msg += '📨 <b>Способ связи:</b> ' + (d.contactMethod || '—') + '\n';

  if (d.telegramUsername) {
    msg += '✈️ <b>Telegram:</b> @' + d.telegramUsername + '\n';
  }

  msg += '\n🕐 <b>Время:</b> ' + new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  return msg;
}
