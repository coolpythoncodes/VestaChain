"use client"

import ConnectButton from "@/components/connect-button"
import useMounted from "@/hooks/use-mounted.hook"
import Link from "next/link"

const Navbar = () => {
  const { isMounted } = useMounted()
  return isMounted ? (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
        <h1>VestaChain</h1>
        <span className="sr-only">Token Vesting Dapp</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <ConnectButton />
      </nav>
    </header>
  ) : null
}

export default Navbar