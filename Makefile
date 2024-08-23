# Install dependencies
forge-install:; forge update
next-install:; (cd app && pnpm install)
install: forge-install next-install

dev:; (cd app && pnpm dev)