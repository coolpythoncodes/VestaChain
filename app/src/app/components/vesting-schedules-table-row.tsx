/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { contractAbi, contractAddress } from "@/lib/constants";
import { BrowserProvider, Contract, formatUnits, toNumber } from "ethers";
import numeral from "numeral";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import TokenSymbol from "@/components/token-symbol";

type Props = {
  stakeholderAddress: string;
};

const VestingSchedulesTableRow = ({ stakeholderAddress }: Props) => {
  const [stakeholderDetails, setStakeholderDetails] = useState(null);
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const getStakeHolderDetails = async () => {
    if (!isConnected) throw Error("User disconnected");
    try {
                  // @ts-expect-error use ts-ignore
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();

      const vestingContract = new Contract(
        contractAddress,
        contractAbi,
        signer,
      );
      // @ts-expect-error use ts-ignore
      const stakeholderDetails = await vestingContract.getStakeholder(
        address,
        stakeholderAddress,
      );
      setStakeholderDetails(stakeholderDetails);
    } catch (error) {
      alert(error);
    }
  };

  const calculateVestingPeriod = () => {
    if (stakeholderDetails === null) return
    const startPeriod = toNumber(stakeholderDetails?.[2])
    const vestingPeriod = toNumber(stakeholderDetails?.[0])
    const totalepochTime = startPeriod + vestingPeriod
    const date = new Date(totalepochTime * 1000);
    // Extracting day, month, and year
    const day = date.getUTCDate();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = date.getUTCFullYear();

    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate
  }

  useEffect(() => {
    if (isConnected && stakeholderAddress) {
      getStakeHolderDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, stakeholderAddress]);

  // console.log("stakeholderDetails", stakeholderDetails);
  return (
    <TableRow>
      <TableCell>{stakeholderAddress}</TableCell>
      <TableCell>
        {stakeholderDetails?.[1]
          ? numeral(formatUnits(stakeholderDetails[1])).format("0,0")
          : null}{" "}
        <TokenSymbol tokenAddress={stakeholderDetails?.[5]} />
      </TableCell>
      <TableCell>{calculateVestingPeriod()}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            `${stakeholderDetails?.[3] ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`,
          )}
        >
          {stakeholderDetails?.[3] ? "Claimed" : "Unclaimed"}
        </Badge>

      </TableCell>
    </TableRow>
  );
};

export default VestingSchedulesTableRow;
