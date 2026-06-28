const clients = new Set();

const addClient    = (res) => clients.add(res);
const removeClient = (res) => clients.delete(res);

const broadcastAll = () => {
  for (const res of clients) {
    try { res.write('event: escrow-updated\ndata: {}\n\n'); } catch {}
  }
};

module.exports = { addClient, removeClient, broadcastAll };
