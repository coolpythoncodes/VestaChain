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
            const ethersProvider = new BrowserProvider(walletProvider);
            const signer = await ethersProvider.getSigner();

            const vestingContract = new Contract(tokenAddress, abi, signer);
            const symbol = await vestingContract.symbol();
            setTokenSymbol(symbol);
        } catch (error) {
            alert("Some thing went wrong");
        }
    };

    useEffect(() => {
        if (tokenAddress) {
            getTotalVestedTokens();
        }
    }, [getTotalVestedTokens, isConnected,tokenAddress]);

    return <small className="text-sm">{tokenSymbol}</small>;
};

export default TokenSymbol;
