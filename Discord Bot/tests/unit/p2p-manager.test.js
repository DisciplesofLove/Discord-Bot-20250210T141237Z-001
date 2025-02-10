const P2PManager = require('../../discord-bot/utils/p2p-manager');

describe('P2P Manager', () => {
    beforeAll(async () => {
        await P2PManager.initialize();
    });

    afterAll(async () => {
        await P2PManager.shutdown();
    });

    describe('IPFS Operations', () => {
        test('should store and retrieve data', async () => {
            const testData = { message: 'test data' };
            const cid = await P2PManager.storeData(testData);
            expect(cid).toBeDefined();

            const retrievedData = await P2PManager.getData(cid);
            expect(retrievedData).toEqual(testData);
        });
    });

    describe('OrbitDB Operations', () => {
        test('should create database', async () => {
            const db = await P2PManager.createDatabase('test-db');
            expect(db).toBeDefined();
            expect(db.address).toBeDefined();
        });
    });

    describe('Initialization', () => {
        test('should initialize all P2P components', () => {
            expect(P2PManager.ipfs).toBeDefined();
            expect(P2PManager.orbitdb).toBeDefined();
            expect(P2PManager.gun).toBeDefined();
            expect(P2PManager.libp2p).toBeDefined();
        });
    });
});