import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ClaimVestedTokensTableRow from "./claim-vested-tokens-table-row";


type Props = {
    stakeholderOrganization: string[]
}


const ClaimVestedTokens = ({ stakeholderOrganization }: Props) => {


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
                            <TableHead>Token address</TableHead>
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