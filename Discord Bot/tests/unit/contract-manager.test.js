const ContractManager = require('../../discord-bot/utils/contract-manager');
const Web3 = require('web3');

jest.mock('web3');

describe('Contract Manager', () => {
    beforeEach(() => {
        Web3.mockClear();
    });

    describe('initialization', () => {
        test('should initialize Web3 connection', async () => {
            await ContractManager.initialize();
            expect(Web3).toHaveBeenCalled();
        });
    });

    describe('contract operations', () => {
        const mockContract = {
            methods: {
                testMethod: jest.fn().mockReturnValue({
                    call: jest.fn().mockResolvedValue('result'),
                    estimateGas: jest.fn().mockResolvedValue(100000),
                    send: jest.fn().mockResolvedValue('transaction')
                })
            }
        };

        beforeEach(async () => {
            await ContractManager.initialize();
            await ContractManager.loadContract('TestContract', [], '0x123');
            ContractManager.contracts.set('TestContract', mockContract);
        });

        test('should call contract method', async () => {
            const result = await ContractManager.callContractMethod('TestContract', 'testMethod', 'arg1');
            expect(result).toBe('result');
        });

        test('should send contract transaction', async () => {
            const result = await ContractManager.sendTransaction('TestContract', 'testMethod', '0x456', 'arg1');
            expect(result).toBe('transaction');
        });
    });
});