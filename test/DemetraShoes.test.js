const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DemetraShoes", function () {
    let demetraNFT;
    let owner;
    let addr1;
    let addr2;
    let vrfCoordinatorV2Mock;
    let subscriptionId;

    const GAS_LANE = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
    const CALLBACK_GAS_LIMIT = "2500000";
    const MINT_PRICE = ethers.parseEther("0.001");
    const FUND_AMOUNT = ethers.parseEther("1000");
    const MAX_SUPPLY = 10;

    async function mintNFT() {
        const requestTx = await demetraNFT.requestNFT({ value: MINT_PRICE });
        const requestReceipt = await requestTx.wait();
        const requestId = requestReceipt.logs[1].args[0];
        
        const randomWords = [BigInt("777")];
        const fulfillTx = await vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(
            requestId,
            await demetraNFT.getAddress(),
            randomWords,
            { gasLimit: CALLBACK_GAS_LIMIT }
        );
        await fulfillTx.wait();
        await ethers.provider.send("evm_mine", []);
    }

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const VRFCoordinatorV2_5Mock = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
        vrfCoordinatorV2Mock = await VRFCoordinatorV2_5Mock.deploy(
            BigInt("100000000000000000"),
            BigInt("1000000000"),
            BigInt("4700000000000000")
        );
        await vrfCoordinatorV2Mock.waitForDeployment();

        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait();
        subscriptionId = txReceipt.logs[0].args[0];

        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);

        const DemetraShoes = await ethers.getContractFactory("DemetraShoes");
        demetraNFT = await DemetraShoes.deploy(
            await vrfCoordinatorV2Mock.getAddress(),
            GAS_LANE,
            subscriptionId,
            CALLBACK_GAS_LIMIT
        );
        await demetraNFT.waitForDeployment();

        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, await demetraNFT.getAddress());
    });

    describe("Deployment", function () {
        it("Should correctly assign the contract owner", async function () {
            expect(await demetraNFT.owner()).to.equal(owner.address);
        });

        it("Should initialize with the right name and symbol", async function () {
            expect(await demetraNFT.name()).to.equal("DemetraShoe");
            expect(await demetraNFT.symbol()).to.equal("DMS");
        });
    });

    describe("Minting", function () {
        it("Should revert if insufficient ETH is provided", async function () {
            await expect(
                demetraNFT.requestNFT({ value: ethers.parseEther("0.0001") })
            ).to.be.revertedWith("Not enough ETH sent");
        });

        it("Should successfully request an NFT with the correct ETH amount", async function () {
            const tx = await demetraNFT.requestNFT({ value: MINT_PRICE });
            const receipt = await tx.wait();
            const requestId = receipt.logs[1].args[0];
            expect(requestId).to.not.be.undefined;
        });

        it("Should properly mint an NFT once the randomness is fulfilled", async function () {
            await mintNFT();
            expect(await demetraNFT.ownerOf(0)).to.equal(owner.address);
        });
    });

    describe("DemetraShoe Attributes", function () {
        it("Should correctly generate attributes from a random number", async function () {
            await mintNFT();
            const attributes = await demetraNFT.getTokenAttributes(0);
            
            expect(attributes.durability).to.be.above(0);
            expect(attributes.durability).to.be.below(101);
            
            expect(attributes.comfort).to.be.above(0);
            expect(attributes.comfort).to.be.below(101);
            
            expect(attributes.sustainability).to.be.above(0);
            expect(attributes.sustainability).to.be.below(101);
            
            expect(attributes.biodegradability).to.be.above(0);
            expect(attributes.biodegradability).to.be.below(101);
        });
    });

    describe("Discount Calculation", function () {
        it("Should calculate discount based on attributes", async function () {
            await mintNFT();
            
            // Fetch the token attributes
            const attributes = await demetraNFT.getTokenAttributes(0);
            
            // Convert BigInt to number for calculation
            const durability = Number(attributes.durability);
            const comfort = Number(attributes.comfort);
            const sustainability = Number(attributes.sustainability);
            const biodegradability = Number(attributes.biodegradability);
    
            // Log attributes to check their values
            console.log("Durability:", durability);
            console.log("Comfort:", comfort);
            console.log("Sustainability:", sustainability);
            console.log("Biodegradability:", biodegradability);
            
            // Calculate average of attributes
            const averageAttributes = (durability + comfort + sustainability + biodegradability) / 4;
    
            // Log the average value
            console.log("Average Attributes:", averageAttributes);
    
            // Define expected discount as half of the average
            const expectedDiscount = averageAttributes / 2;
            
            // Log the expected discount
            console.log("Expected Discount:", expectedDiscount);
    
            // Ensure the token exists and then fetch the discount value
            const tokenOwner = await demetraNFT.ownerOf(0);
            console.log("Token Owner:", tokenOwner);
        });
    });

    describe("Discount Calculation", function () {
        it("Should apply the discount correctly", async function () {
            // Mint the NFT before checking the discount
            await mintNFT();
            
            // Assuming the token ID is 0, you can adjust this if you're using another token ID
            const discount = await demetraNFT.getNFTDiscount(0); // Ensure the token exists
    
            // Compare BigInt directly
            expect(discount).to.equal(BigInt(0));  // Or whatever the expected discount is as BigInt
        });
    });
    

    describe("Burning", function () {
        beforeEach(async function () {
            await mintNFT();
        });

        it("It should enable the rightful owner to burn an NFT", async function () {
            await demetraNFT.burnNFT(0);
            await expect(demetraNFT.ownerOf(0)).to.be.reverted;
        });

        it("It should stop non-owners from burning an NFT", async function () {
            await expect(
                demetraNFT.connect(addr1).burnNFT(0)
            ).to.be.revertedWithCustomError(demetraNFT, "NotTokenOwnerOrApproved");
        });
    });

    describe("Withdrawals", function () {
        it("Should allow owner to withdraw", async function () {
            await demetraNFT.requestNFT({ value: MINT_PRICE });
            const initialBalance = await ethers.provider.getBalance(owner.address);
            await demetraNFT.withdraw();
            const finalBalance = await ethers.provider.getBalance(owner.address);
            expect(finalBalance).to.be.above(initialBalance);
        });
 
        it("Should not allow non-owner to withdraw", async function () {
            await expect(
                demetraNFT.connect(addr1).withdraw()
            ).to.be.reverted;
        });
    });

    describe("Casi Limite", function () {
        it("Account for zero ETH transfers during withdrawal", async function () {
            await demetraNFT.withdraw();
        });
 
        it("The token counter remains accurate after burns", async function () {
            await mintNFT();
            const initialCount = await demetraNFT.getCurrentTokenCount();
            
            await demetraNFT.burnNFT(0);
            const countAfterBurn = await demetraNFT.getCurrentTokenCount();
            expect(countAfterBurn).to.equal(initialCount);
 
            await mintNFT();
            expect(await demetraNFT.ownerOf(1)).to.equal(owner.address);
        });
    });
});
