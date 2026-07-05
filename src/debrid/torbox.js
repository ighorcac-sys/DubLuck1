const axios = require('axios');

const TORBOX_BASE = 'https://api.torbox.app/v1/api';

async function resolve(apiKey, magnet) {
  try {
    // 1. Envia o magnet link para o TorBox via POST
    const addRes = await axios.post(
      `${TORBOX_BASE}/torrents/createtorrent`,
      { magnet: magnet },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!addRes.data?.success || !addRes.data?.data) return null;

    const torrentId = addRes.data.data.torrent_id;

    // 2. Pega os detalhes do torrent para capturar os links de streaming
    const infoRes = await axios.get(
      `${TORBOX_BASE}/torrents/mylist?id=${torrentId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const torrentData = infoRes.data?.data;
    if (!torrentData) return null;

    // Se o TorBox já entregar um link direto para o torrent completo
    if (torrentData.download_url) return torrentData.download_url;

    // Caso contrário, busca o maior arquivo de vídeo dentro dele
    const files = torrentData.files;
    if (!files || files.length === 0) return null;

    const video = files
      .filter(f => /\.(mkv|mp4|avi)$/i.test(f.name || ''))
      .sort((a, b) => (b.size || 0) - (a.size || 0))[0];

    return video?.short_link || files[0]?.short_link || null;
  } catch (err) {
    console.error('[TorBox] Error:', err.message);
    return null;
  }
}

async function isValid(apiKey) {
  try {
    // Endpoint do TorBox para checar se o token do usuário é válido
    const res = await axios.get(`${TORBOX_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    return res.data?.success === true;
  } catch {
    return false;
  }
}

module.exports = { resolve, isValid };
