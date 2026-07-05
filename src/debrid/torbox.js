async function getLink(magnet, token) {
    try {
        if (!magnet || !token) return null;

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
        
        // Proteção contra respostas inválidas ou tokens errados
        if (!data || !data.success || !data.data) {
            console.error('TorBox: Erro ao registrar torrent ou token inválido.', data);
            return null;
        }

        const torrentId = data.data.torrent_id;

        // 2. Pega a lista do torrent para extrair a URL final de streaming
        const dlResponse = await fetch(`https://api.torbox.app/v1/api/torrents/mylist?id=${torrentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const dlData = await dlResponse.json();
        if (!dlData || !dlData.data) return null;

        // Retorna a URL direta de download ou o link do primeiro arquivo disponível
        return dlData.data.download_url || (dlData.data.files && dlData.data.files[0]?.short_link) || null;

    } catch (error) {
        // Se der qualquer erro na API, ele apenas avisa o log em vez de derrubar o app
        console.error('Erro isolado no motor do TorBox:', error.message);
        return null;
    }
}

module.exports = { getLink };
