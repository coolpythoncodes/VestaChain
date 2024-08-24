"use client";

import { env } from "@/env";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const projectId = env.NEXT_PUBLIC_PROJECTID;

const chains = {
  anvil: {
    chainId: 31337,
    name: "Anvil",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "http://127.0.0.1:8545",
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    currency: "ETH",
    explorerUrl: "https://sepolia.etherscan.io/",
    rpcUrl: env.NEXT_PUBLIC_RPCURL,
  }
};

const metadata = {
  name: "VestaChain",
  description: "A token vesting Dapp",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
});

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [chains.sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export const AppKit = ({ children }: { children: React.ReactNode }) => {
  return children;
};


