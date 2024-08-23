/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { contractAddress } from "@/lib/constants";
import {
    useWeb3ModalAccount,
    useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import numeral from "numeral";
import { useEffect } from "react";

type Props = {
    organizationTokenAddress: string;
    totalVestedTokens: number;
    unvestTokenValue: null | number;
    setUnvestTokenValue: (x: number | string) => void;
}

const UnvestedTokens = ({ organizationTokenAddress, totalVestedTokens, unvestTokenValue, setUnvestTokenValue }: Props) => {
    const { isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    const abi = ["function balanceOf(address addr) view returns (uint)"];

    const getUnvestedTokens = async () => {
        if (!organizationTokenAddress && !totalVestedTokens) return;
        if (!isConnected) throw Error("User disconnected");
        try {
            // @ts-expect-error use ts-ignore
            const ethersProvider = new BrowserProvider(walletProvider);
            const signer = await ethersProvider.getSigner();

            const vestingContract = new Contract(organizationTokenAddress, abi, signer);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            // @ts-expect-error use ts-ignore
            const tokenBalance = await vestingContract.balanceOf(contractAddress);
            // @ts-expect-error use ts-ignore
            const unvested = formatUnits(tokenBalance) === "0.0" ? formatUnits(tokenBalance) : formatUnits(tokenBalance) - totalVestedTokens
            setUnvestTokenValue(unvested)
        } catch (error) {
            alert(error);
        }
    };


    useEffect(() => {
        if (isConnected && organizationTokenAddress && totalVestedTokens) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            getUnvestedTokens();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, organizationTokenAddress, totalVestedTokens]);
    return (
        <p>{numeral(unvestTokenValue).format("0,0")}</p>
    )
}

export default UnvestedTokens