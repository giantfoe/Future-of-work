import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center md:items-start md:flex-row justify-center gap-6 py-10 px-4 md:px-6">
        <div className="flex-1 max-w-sm text-center md:text-left">
          <div className="text-lg font-medium mb-2">Bounty Platform</div>
          <p className="text-sm text-gray-500">
            A platform for discovering and completing bounties to earn rewards in the web3 ecosystem.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/bounties" className="text-sm text-gray-500 hover:text-primary">
                  Bounties
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-primary">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-primary">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-sm text-gray-500">
        <div className="max-w-[1440px] px-4 md:px-6 mx-auto">
          © {new Date().getFullYear()} Bounty Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
