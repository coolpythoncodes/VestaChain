import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilePenIcon, Trash2Icon } from "@/components/icons";
import AddStakeholder from "./add-stakeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { contractAbi, contractAddress } from "@/lib/constants";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import numeral from "numeral";
import VestingSchedulesTableRow from "./vesting-schedules-table-row";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import useDisclosure from "@/hooks/useDisclosure.hook";



type Props = {
  stakeholders: string[];
  unvestTokenValue: null | number
};

const VestingSchedule = ({ stakeholders, unvestTokenValue }: Props) => {
  const { isConnected } = useWeb3ModalAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { walletProvider } = useWeb3ModalProvider();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const withdraw = async () => {
    setIsLoading(true);
    try {
      if (!isConnected) throw Error("User disconnected");
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      // The Contract object
      const vestingContract = new Contract(
        contractAddress,
        contractAbi,
        signer,
      );
      const txHash = await vestingContract.WithdrawUnVestedTokens()
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

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vesting Schedules</h2>
        <div className="flex items-center gap-x-5">
          <AddStakeholder />
          {unvestTokenValue ?
            <AlertDialog onOpenChange={onOpen} open={isOpen}>
              <AlertDialogTrigger asChild >
                <Button variant="destructive">Withdraw</Button>
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
                  <Button onClick={withdraw} disabled={isLoading} variant="destructive">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Withdraw</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            : null}
        </div>

      </div>
      {stakeholders?.length ? (
        <div className="mt-4 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stakeholder</TableHead>
                <TableHead>Vested Amount</TableHead>
                <TableHead>Vesting ends</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders?.map((item, index) => (
                <VestingSchedulesTableRow
                  key={`stakeholders-${index}`}
                  stakeholderAddress={item}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
};

export default VestingSchedule;
