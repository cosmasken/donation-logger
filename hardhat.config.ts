import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import '@nomicfoundation/hardhat-verify';
import 'dotenv/config';

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    compilers: [
      {
        version: '0.8.28',
      },
    ],
  },
  networks: {
    rootstockMainnet: {
      type: "http",
      chainType: "l1",
      url: "https://public-node.rsk.co",
      chainId: 30,
      gasPrice: 60000000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    rootstockTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.RSK_TESTNET_RPC_URL || "https://public-node.testnet.rsk.co",
      chainId: 31,
      gasPrice: 60000000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      rootstockTestnet: 'rootstock',
      rootstockMainnet: 'rootstock',
    },
    customChains: [
      {
        network: 'rootstockTestnet',
        chainId: 31,
        urls: {
          apiURL: 'https://be.explorer.testnet.rootstock.io/api/v3/etherscan',
          browserURL: 'https://explorer.testnet.rootstock.io/',
        },
      },
      {
        network: 'rootstockMainnet',
        chainId: 30,
        urls: {
          apiURL: 'https://be.explorer.rootstock.io/api/v3/etherscan',
          browserURL: 'https://explorer.rootstock.io/',
        },
      },
    ],
  },
});
