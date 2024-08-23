import { contractAddress } from "@/lib/constants";
import {
    useWeb3ModalAccount,
    useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import numeral from "numeral";
import { useEffect, useState } from "react";

type Props = {
    organizationTokenAddress: string;
    totalVestedTokens: number;
    unvestTokenValue: null | number;
    setUnvestTokenValue: () => void;
}

const UnvestedTokens = ({ organizationTokenAddress, totalVestedTokens, unvestTokenValue, setUnvestTokenValue }: Props) => {
    const { isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    const abi = ["function balanceOf(address addr) view returns (uint)"];

    const getUnvestedTokens = async () => {
        if (!organizationTokenAddress && !totalVestedTokens) return;
        if (!isConnected) throw Error("User disconnected");
        try {
            const ethersProvider = new BrowserProvider(walletProvider);
            const signer = await ethersProvider.getSigner();

            const vestingContract = new Contract(organizationTokenAddress, abi, signer);
            const tokenBalance = await vestingContract.balanceOf(contractAddress);
            const unvested = formatUnits(tokenBalance) === "0.0" ? formatUnits(tokenBalance) : formatUnits(tokenBalance) - totalVestedTokens
            setUnvestTokenValue(unvested)
        } catch (error) {
            alert(error);
        }
    };


    useEffect(() => {
        if (isConnected && organizationTokenAddress && totalVestedTokens) {
            getUnvestedTokens();
        }

    }, [isConnected, organizationTokenAddress, totalVestedTokens, getUnvestedTokens]);
    return (
        <p>{numeral(unvestTokenValue).format("0,0")}</p>
    )
}

export default UnvestedTokens