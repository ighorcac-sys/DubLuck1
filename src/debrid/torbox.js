const fetch = require('node-fetch'); // ou a biblioteca que o addon usar

async function resolve(apiKey, magnet) {
try {
        // 1. Envia o magnet link para o TorBox
        const response = await fetch('https://api.torbox.app/v1/api/torrents/createtorrent', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ magnet: magnet })
        });
        const data = await response.json();
        
        if (!data.success) throw new Error('Erro ao adicionar magnet no TorBox');

        // 2. Pega o link gerado pelo TorBox (Lógica simplificada)
        const torrentId = data.data.torrent_id;
        const dlResponse = await fetch(`https://api.torbox.app/v1/api/torrents/mylist?id=${torrentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dlData = await dlResponse.json();

        // Retorna o link direto de streaming que o Nuvio vai ler
        return dlData.data.download_url || dlData.data.files[0].short_link; 
    } catch (error) {
        console.error('Erro TorBox:', error);
        return null;
    }
}

module.exports = { resolve, isValid };
