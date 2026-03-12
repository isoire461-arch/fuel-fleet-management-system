import React, { useState } from 'react';
import QRCode from 'qrcode';
import { generateTwoFactorSecret, TwoFactorSecret, verifyTwoFactorToken } from '../services/twoFactorService';

// In a real app the generation step would live on the server; here we call
// the helper directly for demonstration.

const TwoFactorSetup: React.FC<{ userId: string }> = ({ userId }) => {
  const [secret, setSecret] = useState<TwoFactorSecret | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const startSetup = async () => {
    const s = generateTwoFactorSecret(userId);
    setSecret(s);
    const dataUrl = await QRCode.toDataURL(s.otpauthUrl);
    setQrDataUrl(dataUrl);
  };

  const checkToken = () => {
    if (secret && verifyTwoFactorToken(secret.base32, token)) {
      setMessage('Valid code! Two‑factor enabled.');
      // persist secret.base32 encrypted in your backend here
    } else {
      setMessage('Invalid code, try again.');
    }
  };

  return (
    <div className="space-y-4">
      {!secret && (
        <button onClick={startSetup} className="px-4 py-2 bg-indigo-600 text-white rounded">Begin 2FA Setup</button>
      )}
      {secret && (
        <div className="space-y-2">
          <p>Scan this QR code with Google Authenticator or similar:</p>
          <img src={qrDataUrl} alt="2FA QR code" />
          <p>If you can't scan, enter this code manually: <strong>{secret.base32}</strong></p>
          <p>
            <button onClick={() => window.print()} className="px-3 py-1 bg-gray-200 rounded">
              🖨️ Print/Save Secret
            </button>
          </p>
          <div>
            <label className="block text-sm">Enter 6-digit code from app</label>
            <input
              type="text"
              title="6-digit authentication code"
              placeholder="••••••"
              maxLength={6}
              value={token}
              onChange={e => setToken(e.target.value)}
              className="px-2 py-1 border rounded" />
            <button onClick={checkToken} className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Verify</button>
          </div>
          {message && <p className="text-sm text-green-700">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
