import ConnectButton from "@/components/connect-button"
import Link from "next/link"

const Navbar = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
    <Link href="#" className="flex items-center justify-center" prefetch={false}>
      <h1>VestaChain</h1>
      <span className="sr-only">Token Vesting Dapp</span>
    </Link>
    <nav className="ml-auto flex gap-4 sm:gap-6">
      {/* <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        Dashboard
      </Link>
      <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        Create Vesting
      </Link>
      <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        Claim Tokens
      </Link>
      <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        Activity
      </Link> */}
       <ConnectButton />
    </nav>
  </header>
  )
}

export default Navbar