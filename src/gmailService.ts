export const getEmails = async (accessToken: string) => {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch emails');
  }

  const data = await res.json();
  const messages = data.messages || [];

  const detailedMessages = await Promise.all(
    messages.map(async (msg: any) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return await msgRes.json();
    })
  );

  return detailedMessages;
};

export const parseEmailData = (email: any) => {
  const headers = email?.payload?.headers || [];
  const getHeader = (name: string) => {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };

  return {
    id: email.id,
    subject: getHeader('subject') || 'No Subject',
    from: getHeader('from') || 'Unknown Sender',
    date: getHeader('date'),
    snippet: email.snippet,
  };
};

export const sendEmail = async (accessToken: string, to: string, subject: string, htmlBody: string) => {
  const emailLines = [];
  emailLines.push(`To: ${to}`);
  emailLines.push('Content-type: text/html;charset=utf-8');
  emailLines.push('MIME-Version: 1.0');
  // Encode subject to handle special characters properly
  const encodedSubject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  emailLines.push(`Subject: ${encodedSubject}`);
  emailLines.push('');
  emailLines.push(htmlBody);

  const email = emailLines.join('\r\n').trim();
  
  // Base64url encode using unescape and encodeURIComponent for UTF-8 support
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64EncodedEmail,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to send email: ${errorData.error?.message || res.statusText}`);
  }

  return await res.json();
};

