import Link from "next/link"

const Footer = () => {
    return (
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
            <p className="text-xs text-muted-foreground">&copy; 2024 Token Vesting Dapp. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link href="https://github.com/coolpythoncodes/VestaChain" target="_blank" className="text-xs hover:underline underline-offset-4">
                    Source Code
                </Link>
                <Link href="https://twitter.com/DevRapture" target="_blank" className="text-xs hover:underline underline-offset-4">
                    Twitter
                </Link>
                <Link href="https://www.linkedin.com/in/rapture-godson/" target="_blank" className="text-xs hover:underline underline-offset-4">
                    Linkedin
                </Link>
            </nav>
        </footer>
    )
}

export default Footer