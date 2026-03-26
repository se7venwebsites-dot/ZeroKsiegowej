import fetch from 'node-fetch';
import crypto from 'crypto';

/**
 * Serverless Function to authenticate and initialize a session with KSeF.
 * 
 * Logic flow:
 * 1. Request Authorisation Challenge from KSeF.
 * 2. Fetch the KSeF Public Key for encryption.
 * 3. Encrypt the User Token using RSA-OAEP (Token + | + Timestamp).
 * 4. Call InitToken to establish the session.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { nip, token, environment = 'test' } = req.body;

  if (!nip || !token) {
    return res.status(400).json({ error: 'Missing NIP or Token' });
  }

  const baseUrl = environment === 'test' 
    ? 'https://ksef-test.mf.gov.pl/api/online' 
    : 'https://ksef.mf.gov.pl/api/online';

  try {
    // 1. Get Authorisation Challenge
    const challengeResponse = await fetch(`${baseUrl}/Session/AuthorisationChallenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contextIdentifier: {
          type: 'onw', // Osoba nip i wykaz
          identifier: nip
        }
      })
    });

    if (!challengeResponse.ok) {
      const errorText = await challengeResponse.text();
      throw new Error(`Challenge Error: ${errorText}`);
    }

    const { challenge, timestamp } = await challengeResponse.json();

    // 2. Encrypt Token + Timestamp with KSeF Public Key using RSA-OAEP
    // Note: KSeF Public Key can be fetched dynamically or hardcoded.
    // Recommended to fetch it to ensure compatibility.
    const keyResponse = await fetch(`${baseUrl}/security/public-key-certificates`);
    if (!keyResponse.ok) throw new Error('Failed to fetch KSeF public key');
    
    const keyData = await keyResponse.json();
    // Assuming keyData.publicKey contains the Base64 DER encoded public key
    const publicKeyBase64 = keyData.publicKey || keyData.subjectPublicKeyInfo; 
    
    // Convert to PEM format for Node.js crypto
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;

    const dataToEncrypt = `${token}|${new Date(timestamp).getTime()}`;
    
    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        mgf1Hash: 'sha256'
      },
      Buffer.from(dataToEncrypt)
    );

    const encryptedToken = encryptedBuffer.toString('base64');

    // 3. Initialize Token Session
    const initResponse = await fetch(`${baseUrl}/Session/InitToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contextIdentifier: {
          type: 'onw',
          identifier: nip
        },
        encryptedToken: encryptedToken,
        challenge: challenge
      })
    });

    const result = await initResponse.json();

    if (!initResponse.ok) {
      return res.status(initResponse.status).json({
        error: 'KSeF InitToken failed',
        details: result
      });
    }

    // Success - returns authenticationToken and other session info
    return res.status(200).json(result);

  } catch (error) {
    console.error('KSeF Auth Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
