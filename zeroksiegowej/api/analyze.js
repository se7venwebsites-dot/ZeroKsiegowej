export default async function handler(req, res) {
    // Akceptujemy tylko metodę POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metoda nieobsługiwana. Użyj metody POST.' });
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Brak tekstu faktury w obiekcie żądania.' });
    }

    // Bezpiecznie osadzony klucz API działający na serwerach Vercel, niedostępny dla przeglądarek 
    const API_KEY = "AIzaSyDim0yOCmkep70F5j6iVJ3CnXL5OE14KBA"; 
    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const prompt = `Z tego tekstu faktury wyciągnij NIP, datę i kwoty. Zwróć tylko JSON: { "description": "Firma", "amountNet": liczba, "amountVat": liczba, "date": "YYYY-MM-DD", "customerNip": "NIP", "invoiceNr": "nr" }\n\nTekst:\n${text}`;

    try {
        const fetchResult = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!fetchResult.ok) {
            console.error(`Błąd zlecenia API Google: ${fetchResult.status}`);
            return res.status(fetchResult.status).json({ error: `Błąd po stronie Google Gemini API: ${fetchResult.statusText}` });
        }

        const data = await fetchResult.json();
        const rawText = data.candidates[0].content.parts[0].text;
        
        // Zwracamy spakowany ciąg JSON w ciele payloadu `result`
        return res.status(200).json({ result: rawText });
    } catch (error) {
        console.error("Wewnętrzny awaryjny błąd chmury Vercel:", error);
        return res.status(500).json({ error: 'Wystąpił nieoczekiwany awaryjny błąd we wbudowanej funkcji Serverless.' });
    }
}
