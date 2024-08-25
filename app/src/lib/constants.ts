import { env } from "@/env";
import abi from "./vesting-abi.json";

const contractAddress = env.NEXT_PUBLIC_ENVIRONMENT === "development" ? "0x5FbDB2315678afecb367f032d93F642f64180aa3" : "0xd0865AF6Bec88c46Bb69697D08c8fA37900CD754";
const contractAbi = abi.abi;

export { contractAddress, contractAbi };
