async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const subscriptionId = BigInt("107512754148769892861854195230309359094522442645250266405351327891070351018583");

    console.log("Using subscription ID:", subscriptionId.toString());

    const vrfCoordinator = "0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b";
    const gasLane = "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15";  
    const callbackGasLimit = "200000"; 

    console.log("Gas Limit:", callbackGasLimit);

    const DemetraShoes = await ethers.getContractFactory("DemetraShoes");
    const demetraNFT = await DemetraShoes.deploy(
        vrfCoordinator,
        gasLane,
        subscriptionId,
        callbackGasLimit
    );

    await demetraNFT.waitForDeployment();
    const deployedAddress = await demetraNFT.getAddress();
    console.log("DemetraShoes deployed to:", deployedAddress);

    console.log("Verifying contract...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
        await hre.run("verify:verify", {
            address: deployedAddress,
            constructorArguments: [
                vrfCoordinator,
                gasLane,
                subscriptionId,
                callbackGasLimit
            ],
        });
        console.log("Contract verified successfully");
    } catch (error) {
        console.log("Error verifying contract:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });