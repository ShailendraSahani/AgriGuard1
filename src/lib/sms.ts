export async function sendSms(to: string, message: string) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !from) {
      console.warn('Twilio env vars missing; SMS skipped.');
      return;
    }

    const body = new URLSearchParams({
      To: to,
      From: from,
      Body: message,
    });

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Twilio SMS failed:', errorText);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}
