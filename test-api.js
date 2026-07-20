import 'dotenv/config';

async function testConnection() {
    const API_KEY = process.env.NVIDIA_API_KEY;
    const url = "https://integrate.api.nvidia.com/v1/chat/completions"; // Standart URL

    console.log("Bağlantı deneniyor...");
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                model: "meta/llama-3.1-8b-instruct", // Güncel model ismi
                messages: [{ role: "user", content: "Bağlantı başarılı mı?" }],
                max_tokens: 20
            })
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Yanıt:", text);
    } catch (error) {
        console.error("Hata:", error);
    }
}

testConnection();