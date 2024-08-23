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
import { Controller, useForm } from "react-hook-form";
import ErrorText from "@/components/error-text";
import useDisclosure from "@/hooks/useDisclosure.hook";
import { BrowserProvider, Contract, ethers, parseEther } from "ethers";
import { contractAbi, contractAddress } from "@/lib/constants";
import { useState } from "react";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addStakeholder = object({
  stakeholderAddress: string()
    .required("Stakeholder address is required")
    .test(
      "is-valid-address",
      "Invalid Ethereum address",
      (value) => value !== undefined && ethers.isAddress(value),
    ),
  amount: number()
    .positive("Invalid input")
    .integer("Invalid input")
    .typeError("Invalid input")
    .required("amount is required"),
  vestingPeriod: string().required("Vesting period is required"),
});

type FormData = InferType<typeof addStakeholder>;

const AddStakeholder = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(addStakeholder),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const vestingPeriod = +data.vestingPeriod * 24 * 60 * 60; // vesting period in seconds
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
      const txHash = await vestingContract.addStakeholder(
        data.stakeholderAddress,
        parseEther(`${data.amount}`),
        vestingPeriod,
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
    <Dialog open={isOpen} onOpenChange={onOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">Add Stakeholder</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Stakeholder</DialogTitle>
          <DialogDescription>
            Enter the details for the Stakeholder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="space-y-[6px]">
            <Label htmlFor="stakeholderAddress" className="text-right">
              Stakeholder address
            </Label>
            <Input
              placeholder="Enter stakeholder address"
              className="col-span-3"
              {...register("stakeholderAddress")}
            />
            <ErrorText error={errors?.stakeholderAddress?.message} />
          </div>
          <div className="space-y-[6px]">
            <Label htmlFor="tokenName" className="text-right">
              Vesting Amount
            </Label>
            <Input
              placeholder="Enter amount to vest"
              className="col-span-3"
              {...register("amount")}
            />
            <ErrorText error={errors?.amount?.message} />
          </div>
          <div className="space-y-[6px]">
            <Label htmlFor="vestingPeriod" className="text-right">
              Vesting Period
            </Label>
            <Controller
              name="vestingPeriod"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} defaultValue={value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Vesting Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="122">
                      122 days (approx 4 months)
                    </SelectItem>
                    <SelectItem value="365">365 days (1 year)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <ErrorText error={errors?.vestingPeriod?.message} />
          </div>

          <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Stakeholder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStakeholder;
