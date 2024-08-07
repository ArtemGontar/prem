import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { MarketFactory } from '../wrappers/MarketFactory';
import '@ton/test-utils';

describe('MarketFactory', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let marketFactory: SandboxContract<MarketFactory>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        marketFactory = blockchain.openContract(await MarketFactory.fromInit());
        deployer = await blockchain.treasury('deployer');

        const deployResult = await marketFactory.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
        
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: marketFactory.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and mainContract are ready to use 
    });

    it('should create market', async()=>{
        const createMarketResult = await marketFactory.send(deployer.getSender(), {
            value: toNano('0.06')
        }, {
            $$type: 'CreateMarket',
            eventName: "New event",
            eventDescription: "New event",
            eventType: "Crypto",
            endTime: BigInt(Date.now() + 60),
            outcomeName1: "outcomeName1",
            outcomeName2: "outcomeName2",
        })

        const tx = createMarketResult.transactions[1];
        if (tx.description.type !== 'generic') {
            throw new Error('Generic transaction expected');
        }
    
        // Check that the storagePhase fees are less than 1 TON over the course of a year
        console.log(tx.totalFees);
        
        expect(createMarketResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: marketFactory.address,
            success: true,
        });

        
    })

    it('should handle invalid end time', async () => {
        const createMarketResult = await marketFactory.send(deployer.getSender(), {
            value: toNano('0.06')
        }, {
            $$type: 'CreateMarket',
            eventName: "New event",
            eventDescription: "New event",
            eventType: "Crypto",
            endTime: 0n,
            outcomeName1: "outcomeName1",
            outcomeName2: "outcomeName2",
        })

        expect(createMarketResult.transactions).toHaveTransaction({
            from: deployer.address,  
            to: marketFactory.address,
            success: false
        });
    });

    // Testing transaction fees
    it('should storage fees cost less than 1 TON', async () => {
        const time1 = Math.floor(Date.now() / 1000);
        const time2 = time1 + 365 * 24 * 60 * 60;

        blockchain.now = time1;
        await marketFactory.send(deployer.getSender(), {
            value: toNano('0.06')
        }, {
            $$type: 'CreateMarket',
            eventName: "New event",
            eventDescription: "New event",
            eventType: "Crypto",
            endTime: BigInt(Date.now() + 60), //add now time
            outcomeName1: "outcomeName1",
            outcomeName2: "outcomeName2",
        });
    
        blockchain.now = time2;

        const res2 = await marketFactory.send(deployer.getSender(), {
            value: toNano('0.06')
        }, {
            $$type: 'CreateMarket',
            eventName: "New event 2",
            eventDescription: "New event 2",
            eventType: "Crypto",
            endTime: BigInt(Date.now() + 60),
            outcomeName1: "outcomeName1",
            outcomeName2: "outcomeName2",
        });
    
        const tx2 = res2.transactions[1];
        if (tx2.description.type !== 'generic') {
            throw new Error('Generic transaction expected');
        }
    
        // Check that the storagePhase fees are less than 1 TON over the course of a year
        expect(tx2.description.storagePhase?.storageFeesCollected).toBeLessThanOrEqual(toNano('1'));   
    });
});
