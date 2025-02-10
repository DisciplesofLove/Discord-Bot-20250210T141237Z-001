const Libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const Mplex = require('libp2p-mplex');
const { Noise } = require('libp2p-noise');

describe('P2P Network Integration', () => {
    let node;

    beforeEach(async () => {
        node = await Libp2p.create({
            addresses: {
                listen: ['/ip4/127.0.0.1/tcp/0']
            },
            modules: {
                transport: [TCP],
                streamMuxer: [Mplex],
                connEncryption: [Noise]
            }
        });
        await node.start();
    });

    afterEach(async () => {
        await node.stop();
    });

    test('should start and stop successfully', () => {
        expect(node.isStarted()).toBe(true);
    });

    // Add more integration tests here
});