/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    useWeb3ModalAccount,
    useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";
import { useEffect, useState } from "react";

type Props = {
    tokenAddress: string | undefined;
};

const TokenSymbol = ({ tokenAddress }: Props) => {
    const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
    const { isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    const abi = ["function symbol() view returns (string)"];

    const getTotalVestedTokens = async () => {
        if (!isConnected) throw Error("User disconnected");
        try {
                        // @ts-expect-error use ts-ignore
            const ethersProvider = new BrowserProvider(walletProvider);
            const signer = await ethersProvider.getSigner();
            // @ts-expect-error use ts-ignore
            const vestingContract = new Contract(tokenAddress, abi, signer);
                        // @ts-expect-error use ts-ignore
            const symbol = await vestingContract.symbol();
            setTokenSymbol(symbol);
        } catch (error) {
            alert(error);
        }
    };

    useEffect(() => {
        if (tokenAddress) {
            getTotalVestedTokens();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected,tokenAddress]);

    return <small className="text-sm">{tokenSymbol}</small>;
};

export default TokenSymbol;
