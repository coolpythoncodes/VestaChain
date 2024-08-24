/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { contractAbi, contractAddress } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import {
  BrowserProvider,
  Contract,
  formatUnits,
  toNumber,
} from "ethers";
import { useEffect, useState } from "react";
import TokenSymbol from "@/components/token-symbol";
import { cn } from "@/lib/utils";
import numeral from "numeral";
import useDisclosure from "@/hooks/useDisclosure.hook";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


type Props = {
  address: string;
};

const ClaimVestedTokensTableRow = ({ address }: Props) => {
  const [organization, setOrganization] = useState(null);
  const [stakeholderDetails, setStakeholderDetails] = useState(null);
  const { address: stakeholderAddress, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const getOrganization = async () => {
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
      const organizationData = await vestingContract.getOrganization(address);
      setOrganization(organizationData);
    } catch (error) {
      alert(error);
    }
  };

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
    if (stakeholderDetails === null) return;
    const startPeriod = toNumber(stakeholderDetails?.[2]);
    const vestingPeriod = toNumber(stakeholderDetails?.[0]);
    const totalepochTime = startPeriod + vestingPeriod;
    const date = new Date(totalepochTime * 1000);
    // Extracting day, month, and year
    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();
    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
  };

  const canClaim = () => {
    if (stakeholderDetails === null) return;
    const startPeriod = toNumber(stakeholderDetails?.[2]);
    const vestingPeriod = toNumber(stakeholderDetails?.[0]);
    const totalepochTime = startPeriod + vestingPeriod;
    const currentEpochTime = Math.floor(new Date().getTime() / 1000.0);
    if (totalepochTime <= currentEpochTime && !stakeholderDetails?.[3]) {
      return true;
    } else {
      return false;
    }
  };

  const claim = async () => {
    setIsLoading(true);
    try {
      if (!isConnected) throw Error("User disconnected");
                  // @ts-expect-error use ts-ignore
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      // The Contract object
      const vestingContract = new Contract(
        contractAddress,
        contractAbi,
        signer,
      );
                  // @ts-expect-error use ts-ignore
      const txHash = await vestingContract.claimVestedTokens(address)
      const receipt = await txHash.wait();
      if (receipt) {
        router.refresh();
        setIsLoading(false);
        onClose()
      }
    } catch (error) {
      setIsLoading(false);
      alert(error);
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      getOrganization();
      getStakeHolderDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, organization]);
console.log("canClaim()",canClaim())

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{organization?.[0]}</div>
            <div className="text-sm text-muted-foreground">
              {organization?.[1]}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {stakeholderDetails?.[1]
          ? numeral(formatUnits(stakeholderDetails[1])).format("0,0")
          : null}{" "}
        <TokenSymbol tokenAddress={organization?.[2]} />
      </TableCell>
      <TableCell>{calculateVestingPeriod()}</TableCell>
      <TableCell>
        {" "}
        <Badge
          variant="outline"
          className={cn(
            `${stakeholderDetails?.[3] ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`,
          )}
        >
          {stakeholderDetails?.[3] ? "Claimed" : "Unclaimed"}
        </Badge>
      </TableCell>
      <TableCell>{stakeholderDetails?.[5]}</TableCell>
      <TableCell>
        <AlertDialog onOpenChange={onOpen} open={isOpen}>
          <AlertDialogTrigger asChild >
            <Button disabled={!canClaim()} size="sm" className="">
              {!canClaim() ? "Already claimed" : "Claim"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to withdraw all unvested tokens
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={onClose} variant="outline">Cancel</Button>
              <Button onClick={claim} disabled={isLoading} variant="destructive">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                claim</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </TableCell>
    </TableRow>
  );
};

export default ClaimVestedTokensTableRow;
