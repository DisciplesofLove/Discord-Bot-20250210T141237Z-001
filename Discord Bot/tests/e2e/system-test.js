const { Client } = require('discord.js');
const P2PManager = require('../../discord-bot/utils/p2p-manager');
const ContractManager = require('../../discord-bot/utils/contract-manager');
const BackupManager = require('../../discord-bot/utils/backup');
const { permissionManager } = require('../../discord-bot/middleware/permissionManager');
const logger = require('../../discord-bot/utils/logger');

describe('System Integration Test', () => {
    let client;

    beforeAll(async () => {
        // Initialize all core components
        client = new Client({ intents: [] });
        await P2PManager.initialize();
        await ContractManager.initialize();
        await BackupManager.initialize();
        
        logger.info('System test initialization complete');
    });

    afterAll(async () => {
        // Cleanup
        await P2PManager.shutdown();
        await client.destroy();
    });

    describe('Complete System Flow', () => {
        test('should execute full command pipeline with decentralized storage', async () => {
            // 1. Store data in IPFS
            const testData = { message: 'test command data' };
            const cid = await P2PManager.storeData(testData);
            expect(cid).toBeDefined();

            // 2. Create and use OrbitDB database
            const db = await P2PManager.createDatabase('system-test-db');
            expect(db.address).toBeDefined();

            // 3. Test smart contract integration
            const mockContract = {
                methods: {
                    testMethod: () => ({
                        call: async () => 'success',
                        send: async () => ({ transactionHash: '0x123' })
                    })
                }
            };
            await ContractManager.loadContract('TestContract', [], '0x123');
            ContractManager.contracts.set('TestContract', mockContract);

            // 4. Test backup system
            const { backupCID } = await BackupManager.createBackup();
            expect(backupCID).toBeDefined();

            // 5. Verify data retrieval
            const retrievedData = await P2PManager.getData(cid);
            expect(retrievedData).toEqual(testData);

            // 6. Test permission system
            const mockMember = {
                roles: {
                    cache: new Map([
                        ['admin', { name: 'admin' }]
                    ])
                }
            };
            const hasPermission = permissionManager.checkPermission(mockMember, 2);
            expect(hasPermission).toBe(true);

            logger.info('System test complete', {
                ipfsCID: cid,
                dbAddress: db.address,
                backupCID: backupCID
            });
        });

        test('should handle errors and recovery gracefully', async () => {
            // Test error handling and recovery mechanisms
            const errorPromise = P2PManager.getData('invalid-cid');
            await expect(errorPromise).rejects.toThrow();

            // Verify system remains operational after error
            const testData = { message: 'recovery test' };
            const cid = await P2PManager.storeData(testData);
            expect(cid).toBeDefined();
        });

        test('should maintain data consistency across components', async () => {
            // Store data in IPFS and verify through OrbitDB
            const testData = { key: 'consistency-test', value: Date.now() };
            const cid = await P2PManager.storeData(testData);
            
            // Create database entry referencing IPFS data
            const db = await P2PManager.createDatabase('consistency-test-db');
            await db.add({ dataCID: cid });

            // Verify data through both systems
            const ipfsData = await P2PManager.getData(cid);
            expect(ipfsData).toEqual(testData);

            // Create backup and verify reference
            const { backupCID } = await BackupManager.createBackup();
            const backupRef = await P2PManager.getData(backupCID);
            expect(backupRef.type).toBe('backup_reference');
        });
    });

    describe('Performance and Load Testing', () => {
        test('should handle multiple concurrent operations', async () => {
            const operations = Array(10).fill().map(async (_, i) => {
                const data = { test: `concurrent-${i}` };
                const cid = await P2PManager.storeData(data);
                const retrieved = await P2PManager.getData(cid);
                expect(retrieved).toEqual(data);
            });

            await Promise.all(operations);
        });
    });
});