/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import ConnectButton from "@/components/connect-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import numeral from "numeral";

import { contractAbi, contractAddress } from "@/lib/constants";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, formatUnits, ZeroAddress } from "ethers";
import { useEffect, useState } from "react";
import CreateOrganization from "./components/create-organization";
import TokenSymbol from "@/components/token-symbol";
import VestingSchedule from "./components/vesting-schedules";
import useMounted from "@/hooks/use-mounted.hook";
import UnvestedTokens from "./components/unvested-tokens";
import ClaimVestedTokens from "./components/claim-vested-tokens";
import { env } from "@/env";

export default function HomePage() {
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [organization, setOrganization] = useState(null);
  const [totalVestedTokens, setTotalVestedTokens] = useState<string | null>(
    null,
  );
  const [unvestTokenValue, setUnvestTokenValue] = useState<number | null>(null);
  const [stakeholderOrganization, setStakeholderOrganization] = useState<
    null | string[]
  >(null);

  const { isMounted } = useMounted();

  const envChainID = env.NEXT_PUBLIC_ENVIRONMENT === "development" ? 31337 : 11155111

  const getTotalVestedTokens = async () => {
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
      const amount = await vestingContract.getTotalVestedAmount(address);

      setTotalVestedTokens(formatUnits(amount));
    } catch (error) {
      alert(error);
    }
  };

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

  const getOrganizationOfStakeholder = async () => {
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
      const data = await vestingContract.getOrganizationsForStakeholder(address);
      setStakeholderOrganization(data);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    if (isConnected && isMounted && chainId == envChainID) {
      getOrganization();
      getTotalVestedTokens();
      getOrganizationOfStakeholder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isMounted, envChainID,chainId]);


  if (!isMounted) {
    return <div className="flex-1" />;
  }

  if (chainId !== envChainID) {
    return (
      <div className="grid flex-1 place-items-center gap-8 p-4 md:p-8 lg:p-12">
        <p className="text-lg text-gray-500">Please kindly connect you wallet and ensure you are on the right network</p>
      </div>
    )
  }
  return !isConnected ? (
    <div className="grid flex-1 place-items-center gap-8 p-4 md:p-8 lg:p-12">
      <ConnectButton />
    </div>
  ) : (
    <main className="grid flex-1 gap-8 p-4 md:p-8 lg:p-12">
      <section>
        <h1 className="text-xl font-bold md:text-3xl">
          Token Vesting Dashboard
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your token vesting schedules and claim vested tokens.
        </p>
      </section>

      {organization === null || organization?.[1] === ZeroAddress ? (
        <CreateOrganization />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Vested Tokens</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-4xl font-bold">
                  {numeral(totalVestedTokens).format("0,0")}
                  <TokenSymbol tokenAddress={organization?.[2]} />
                </div>
                {/* <BitcoinIcon className="size-8 text-primary" /> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vesting Schedules</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-4xl font-bold">
                  {/* @ts-expect-error use ts-ignore */}
                  {organization?.[3]?.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Unvested Tokens</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-baseline text-4xl font-bold">
                  {/* @ts-expect-error use ts-ignore */}
                  <UnvestedTokens
                    {...{
                      unvestTokenValue,
                      setUnvestTokenValue,
                      totalVestedTokens,
                    }}
                    organizationTokenAddress={organization?.[2]}
                  />
                  <TokenSymbol tokenAddress={organization?.[2]} />
                </div>
                {/* <WalletIcon className="size-8 text-primary" /> */}
              </CardContent>
            </Card>
          </section>
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent>
              The organization you created is named "
              <span className="font-bold">{organization?.[0]}</span>" and the
              token address is{" "}
              <span className="font-bold">{organization?.[2]}</span>.
            </CardContent>
          </Card>
        </>
      )}

      {organization === null || organization?.[1] === ZeroAddress ? null : (
        <VestingSchedule
          stakeholders={organization?.[3]}
          {...{ unvestTokenValue }}
        />
      )}

      {stakeholderOrganization?.length ? (
        <ClaimVestedTokens {...{ stakeholderOrganization }} />
      ) : null}

      {/* <section>
        <h2 className="text-2xl font-bold">Activity</h2>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Vesting Schedule Created</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-muted-foreground">
                        0x123...abc
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>5,000 TKNS</TableCell>
                <TableCell>2023-04-01 10:30 AM</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Token Claimed</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Sarah Miller</div>
                      <div className="text-sm text-muted-foreground">
                        0x456...def
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>2,500 TKNS</TableCell>
                <TableCell>2023-05-15 3:45 PM</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vesting Schedule Cancelled</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Michael Johnson</div>
                      <div className="text-sm text-muted-foreground">
                        0x789...ghi
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>20,000 TKNS</TableCell>
                <TableCell>2023-06-01 9:00 AM</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section> */}
    </main>
  );
}
