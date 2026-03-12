/// <reference types="vite/client" />
// Lightweight Google Drive upload helper using Google Identity Services
// Requires a Vite env variable `VITE_GOOGLE_CLIENT_ID` to be set to your OAuth Client ID

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

function loadGIS(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.oauth2) {
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

async function requestAccessToken(clientId: string): Promise<string> {
  await loadGIS();
  return new Promise((resolve, reject) => {
    const googleAny = (window as any).google;
    if (!googleAny || !googleAny.accounts || !googleAny.accounts.oauth2) {
      return reject(new Error('Google Identity Services not available'));
    }
    const tokenClient = googleAny.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error) return reject(resp);
        resolve(resp.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function uploadToDrive(fileName: string, content: string, mimeType = 'text/csv') {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable');

  const accessToken = await requestAccessToken(clientId);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    close_delim;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive upload failed: ${res.status} ${text}`);
  }

  return res.json();
}
