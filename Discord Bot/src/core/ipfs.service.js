const { create } = require('ipfs-http-client');
const fs = require('fs');

class IPFSService {
  constructor() {
    this.ipfs = create({
      host: process.env.IPFS_HOST,
      port: process.env.IPFS_PORT,
      protocol: process.env.IPFS_PROTOCOL
    });
  }

  async uploadToIPFS(filePath) {
    const file = fs.readFileSync(filePath);
    const result = await this.ipfs.add(file);
    return result.cid.toString();
  }

  async downloadDataset(hash) {
    const chunks = [];
    for await (const chunk of this.ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}

module.exports = { IPFSService };
