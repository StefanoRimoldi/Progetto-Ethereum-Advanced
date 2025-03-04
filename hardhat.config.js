require("@nomicfoundation/hardhat-toolbox");

const INFURA_API_KEY = "bb65298af67c444d982f6c2ff4f28085"; // Inserisci la tua chiave Infura
const PRIVATE_KEY_1 = "bee128c6c09840ccc6b5977c4bf8eb8dafb64825b167f793fb5ea6aa79562827"; // Inserisci la tua chiave privata
const ETHERSCAN_API_KEY = "7ND28UW4P57E6RFGTRXV7XVGIT4J5SUPXT"; // Aggiungi qui la tua chiave API di Etherscan

module.exports = {
  solidity: "0.8.20", // Versione di Solidity
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`, // Usa la chiave API di Infura
      accounts: [PRIVATE_KEY_1],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test", // Cartella dei test
    cache: "./cache", // Cache di Hardhat
    artifacts: "./artifacts", // Artifacts generati dal build
    deploy: "./scripts",
  },
  mocha: {
    timeout: 40000, // Timeout per i test
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY, // La tua chiave API di Etherscan per la rete Sepolia
    },
  },
};
