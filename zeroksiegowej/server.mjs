import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001; 

// Klucz poprawiony względem literówki w prośbie uwzględniając ten z dashboard.html
const API_KEY = "AIzaSyDim0yOCmkep70F5j6iVJ3CnXL5OE14KBA"; 
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Zezwól na zapytania tylko z localhost:3000 (Twojego frontendu)
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Parsowanie JSON z body zapytań
app.use(express.json());

app.post('/analyze-invoice', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: "Brak zdekodowanego tekstu OCR w obiekcie żądania." });
        }

        console.log("Odebrano żądanie analizy. Zestawianie przesyłki do Gemini API...");

        // Wiążemy tekst wpisany/znaleziony na fakturze z formatką JSON prompta
        const prompt = `Z tego tekstu faktury wyciągnij NIP, datę i kwoty. Zwróć tylko JSON: { "description": "Firma", "amountNet": liczba, "amountVat": liczba, "date": "YYYY-MM-DD", "customerNip": "NIP", "invoiceNr": "nr" }\n\nTekst:\n${text}`;

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
            return res.status(fetchResult.status).json({ error: `Błąd wewnętrzny Gemini API: ${fetchResult.statusText}` });
        }

        const responseJson = await fetchResult.json();
        
        // Zwracamy wygenerowany wynik testowy wprost do klienta
        const rawText = responseJson.candidates[0].content.parts[0].text;
        res.json({ result: rawText });

    } catch (error) {
        console.error("Szczegóły błędu serwera pośredniczącego:", error);
        res.status(500).json({ error: "Wystąpił nieoczekiwany błąd serwera." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Proxy Serwer działa na porcie ${PORT}`);
    console.log(`CORS jest otwarty WYŁĄCZNIE dla adresu: http://localhost:3000`);
});
