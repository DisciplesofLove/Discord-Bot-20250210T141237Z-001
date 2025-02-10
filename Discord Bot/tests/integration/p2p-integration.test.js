const P2PManager = require('../../discord-bot/utils/p2p-manager');
const ContractManager = require('../../discord-bot/utils/contract-manager');
const BackupManager = require('../../discord-bot/utils/backup');

describe('P2P Integration Tests', () => {
    beforeAll(async () => {
        await P2PManager.initialize();
        await ContractManager.initialize();
        await BackupManager.initialize();
    });

    afterAll(async () => {
        await P2PManager.shutdown();
    });

    describe('Data Flow', () => {
        test('should store and retrieve data through IPFS', async () => {
            const testData = { key: 'test', value: 'data' };
            const cid = await P2PManager.storeData(testData);
            const retrievedData = await P2PManager.getData(cid);
            expect(retrievedData).toEqual(testData);
        });

        test('should create and use OrbitDB database', async () => {
            const db = await P2PManager.createDatabase('test-integration');
            expect(db.address).toBeDefined();
        });

        test('should perform backup and verify data', async () => {
            const { backupCID } = await BackupManager.createBackup();
            expect(backupCID).toBeDefined();
            
            const backupRef = await P2PManager.getData(backupCID);
            expect(backupRef.type).toBe('backup_reference');
        });
    });

    describe('Smart Contract Integration', () => {
        test('should interact with blockchain', async () => {
            const mockContract = {
                methods: {
                    test: () => ({
                        call: async () => 'success'
                    })
                }
            };

            await ContractManager.loadContract('TestContract', [], '0x123');
            ContractManager.contracts.set('TestContract', mockContract);

            const result = await ContractManager.callContractMethod('TestContract', 'test');
            expect(result).toBe('success');
        });
    });
});