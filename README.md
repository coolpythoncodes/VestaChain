## VestaChain - ERC20 Vesting DApp

VestaChain is a decentralized application (DApp) designed to facilitate token vesting for organizations that wish to manage the distribution of their ERC20 tokens to stakeholders such as founders, investors, and other key contributors.

By utilizing VestaChain, organizations can securely and transparently manage the vesting process, ensuring that tokens are released to stakeholders only after a predefined vesting period.

## Key Features

### 1. Organization Registration and Token Creation

Organizations can register themselves on VestaChain by providing their details. During the registration process, a unique ERC20 token is created specifically for the organization.

### 2. Adding Stakeholders

Organizations can add stakeholder addressing to their vesting schedules. These stajeholders can claim their vested tokens after the vesting period has elapsed.
This ensures that only authorized stakeholders can participate in the vesting process.

### 3. Secure Token Claims

Whitelisted stakeholders can claim their vested tokens after the vesting period has elapsed.
The DApp ensures that tokens are securely transferred to the stakeholder's wallet only after the vesting conditions have been met.

The organization owner can withdraw all unvested tokens at any time.

### 4. Transparency and Immutability

All transactions and vesting schedules are recorded on the blockchain, ensuring transparency and immutability.
Stakeholders can verify their vesting schedule and track the status of their tokens in real-time.

## Technology Stack & Tools

- NextJS
- Solidity
- Foundry
- Ethers.js
- Web3Modal

### Quickstart

Jumpstart your development with these simple steps:

Clone and Set Up the Project

1. **Clone and Set Up the Project**

```shell bash
git clone https://github.com/coolpythoncodes/VestaChain
cd VestaChain
make install
```

2. **Update the environment variables**

Copy the env example files to env files

```shell
make copy-env
```

3. **Launch the NextJS Application**

```shell
make dev
```

## Show your support

Give a ⭐ if you like this project!

## Useful links

- [Verified Vesting address on Sepolia etherscan](https://sepolia.etherscan.io/address/0xd0865AF6Bec88c46Bb69697D08c8fA37900CD754)
