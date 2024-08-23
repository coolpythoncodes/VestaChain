import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ClaimVestedTokensTableRow from "./claim-vested-tokens-table-row";


type Props = {
    stakeholderOrganization: string[]
}


const ClaimVestedTokens = ({ stakeholderOrganization }: Props) => {
    //       const { address, isConnected } = useWeb3ModalAccount();
    //   const { walletProvider } = useWeb3ModalProvider();

    //   const getOrganizationOfStakeholder = async () => {
    //     if (!isConnected) throw Error("User disconnected");
    //     try {
    //       const ethersProvider = new BrowserProvider(walletProvider);
    //       const signer = await ethersProvider.getSigner();

    //       const vestingContract = new Contract(
    //         contractAddress,
    //         contractAbi,
    //         signer,
    //       );
    //       const organizationData = await vestingContract.getOrganization(address);
    //       setOrganization(organizationData);
    //     } catch (error) {
    //       alert(error);
    //     }
    //   };

    return (
        <section>
            <h2 className="text-2xl font-bold">Claim Vested Tokens</h2>
            <div className="mt-4 overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organization</TableHead>
                            <TableHead>Vested Tokens</TableHead>
                            <TableHead>Vesting ends</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            stakeholderOrganization?.map((item, index) => (
                                <ClaimVestedTokensTableRow key={`stakeholder-Organization-${index}`} address={item} />
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </section>

    )
}

export default ClaimVestedTokens