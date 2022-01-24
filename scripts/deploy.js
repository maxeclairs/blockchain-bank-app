// import hre

const hre = require('hardhat');

// create main function
async function main() {
    // get signer
    const [owner] = await hre.ethers.getSigners();

    //create contract factory
    const BankContractFactory = await hre.ethers.getContractFactory("Bank");
    
    // deploy contract
    const BankContract = await BankContractFactory.deploy();
    await BankContract.deployed();

    // console log the contract address
    console.log("Bank Contract deployed to:", BankContract.address);
    console.log("Bank Contract Owner:", owner.address);

}

// run the main function
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
