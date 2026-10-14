
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram not configured' });
  }

  try {
    const { answers, score, contact, consent } = req.body || {};

    if (consent !== true) {
      return res.status(400).json({ error: 'Consent required' });
    }

    if (!Array.isArray(answers) || answers.length !== 15 ||
        !answers.every(a => typeof a === 'boolean')) {
      return res.status(400).json({ error: 'Invalid answers' });
    }

    const total = answers.filter(Boolean).length;

    const message = [
      '📋 Новый результат фитнес-теста',
      '',
      `Результат: ${total} из 15`,
      `Контакт: ${String(contact || 'Не указан').slice(0, 200)}`,
      '',
      ...answers.map((a, i) =>
        `${i + 1}. ${a ? 'Да' : 'Нет'}`
      )
    ].join('\n');

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Telegram delivery failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
