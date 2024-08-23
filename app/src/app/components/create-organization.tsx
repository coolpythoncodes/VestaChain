/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { number, object, string, type InferType } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import ErrorText from "@/components/error-text";
import useDisclosure from "@/hooks/useDisclosure.hook";
import { BrowserProvider, Contract, parseEther } from "ethers";
import { contractAbi, contractAddress } from "@/lib/constants";
import { useState } from "react";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const registerOrganization = object({
  organizationName: string().required("Organization is required"),
  tokenName: string().required("Token name is required"),
  tokenSymbol: string().required("Token symbol is required"),
  initialSupply: number()
    .positive("Invalid input")
    .integer("Invalid input")
    .typeError("Invalid input")
    .required("Initial supply is required"),
});

type FormData = InferType<typeof registerOrganization>;

const CreateOrganization = () => {
  const { isOpen, onOpen,onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const {isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(registerOrganization),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const initialSupply = parseEther(`${data.initialSupply}`);

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
      const txHash = await vestingContract.register(
        data.organizationName,
        data.tokenName,
        data.tokenSymbol,
        initialSupply,
      );
      const receipt = await txHash.wait();
      if (receipt) {
        router.refresh();
        setIsLoading(false);
        reset();
        onClose();
      }
    } catch (error) {
      setIsLoading(false);
      alert(error);
    }
  };

  return (
    <div className="space-y-2">
      <p>
        You have not created any organization. Create if you want to vest tokens
      </p>
      <Dialog open={isOpen} onOpenChange={onOpen}>
        <DialogTrigger asChild>
          <Button className="shrink-0">Create Organization</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register Organization</DialogTitle>
            <DialogDescription>
              Enter the details for your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="space-y-[6px]">
              <Label htmlFor="organizationName" className="text-right">
                Organization Name
              </Label>
              <Input
                placeholder="Enter organization name"
                className="col-span-3"
                {...register("organizationName")}
              />
              <ErrorText error={errors?.organizationName?.message} />
            </div>
            <div className="space-y-[6px]">
              <Label htmlFor="tokenName" className="text-right">
                Token Name
              </Label>
              <Input
                placeholder="Enter token name"
                className="col-span-3"
                {...register("tokenName")}
              />
              <ErrorText error={errors?.tokenName?.message} />
            </div>
            <div className="space-y-[6px]">
              <Label htmlFor="tokenSymbol" className="text-right">
                Token Symbol
              </Label>
              <Input
                placeholder="Enter token symbol"
                className="col-span-3"
                {...register("tokenSymbol")}
              />
              <ErrorText error={errors?.tokenSymbol?.message} />
            </div>
            <div className="space-y-[6px]">
              <Label htmlFor="initialSupply" className="text-right">
                Initial Token Supply
              </Label>
              <Input
                placeholder="Enter initial token supply"
                className="col-span-3"
                {...register("initialSupply")}
              />
              <ErrorText error={errors?.initialSupply?.message} />
            </div>
            <Button disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateOrganization;
