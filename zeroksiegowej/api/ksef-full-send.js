import fetch from 'node-fetch';
import crypto from 'crypto';

/**
 * FULL KSeF AUTOMATION: Auth -> Session -> Send
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { nip, token, xml, environment = 'test' } = req.body;
  if (!nip || !token || !xml) return res.status(400).json({ error: 'Missing Data' });

  const baseUrl = environment === 'test' 
    ? 'https://ksef-test.mf.gov.pl/api/online' 
    : 'https://ksef.mf.gov.pl/api/online';

  try {
    // 1. AUTH CHALLENGE
    const challengeRes = await fetch(`${baseUrl}/Session/AuthorisationChallenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextIdentifier: { type: 'onw', identifier: nip } })
    });
    const { challenge, timestamp } = await challengeRes.json();

    // 2. ENCRYPTION (RSA-OAEP)
    const keyRes = await fetch(`${baseUrl}/security/public-key-certificates`);
    const keyData = await keyRes.json();
    const publicKeyBase64 = keyData.publicKey || keyData.subjectPublicKeyInfo; 
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
    const dataToEncrypt = `${token}|${new Date(timestamp).getTime()}`;
    
    const encryptedToken = crypto.publicEncrypt({
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
      mgf1Hash: 'sha256'
    }, Buffer.from(dataToEncrypt)).toString('base64');

    // 3. INIT SESSION
    const initRes = await fetch(`${baseUrl}/Session/InitToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contextIdentifier: { type: 'onw', identifier: nip },
        encryptedToken,
        challenge
      })
    });
    const initResult = await initRes.json();
    const sessionToken = initResult.sessionToken?.token || initResult.authenticationToken?.token;
    if (!sessionToken) throw new Error("Could not obtain session token");

    // 4. SEND INVOICE
    const sendRes = await fetch(`${baseUrl}/Invoice/Send`, {
      method: 'PUT', // KSeF uses PUT for sending small invoices
      headers: { 
        'Content-Type': 'application/octet-stream',
        'SessionToken': sessionToken
      },
      body: Buffer.from(xml) // The XML as binary
    });

    const sendResult = await sendRes.json();
    
    if (!sendRes.ok) {
      return res.status(sendRes.status).json({
        success: false,
        error: `KSeF Invoice/Send Error (${sendRes.status})`,
        details: sendResult
      });
    }

    // 5. Close Session (Best practice)
    await fetch(`${baseUrl}/Session/Terminate`, {
      method: 'POST',
      headers: { 'SessionToken': sessionToken }
    });

    return res.status(200).json({
      success: true,
      referenceNumber: sendResult.referenceNumber || "Brak numeru",
      details: sendResult
    });

  } catch (error) {
    console.error('KSeF Full Automation Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
