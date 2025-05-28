import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Users, Wallet, Target } from "lucide-react"
import FeaturedBounties from "@/components/featured-bounties"
import RecentWinners from "@/components/recent-winners"
import RecentActivities from "@/components/recent-activities"
import { getBounties, getMockBounties } from "@/lib/airtable-service"
import { getWinners, getRecentActivities } from "@/lib/airtable"

export default async function Home() {
  // Try to get bounties from Airtable, fall back to mock data if it fails
  let bounties = await getBounties()

  // If no bounties were returned (due to an error), use mock data
  if (bounties.length === 0) {
    console.log("Using mock bounty data due to Airtable connection failure")
    bounties = getMockBounties()
  }

  const featuredBounties = bounties.slice(0, 6)
  const winners = await getWinners()
  const activities = await getRecentActivities()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative">
        {/* Background Pattern */}
        <div
          className="absolute left-0 right-0 bottom-0 top-[50px] bg-gradient-to-b from-gray-50 to-white"
          aria-hidden="true"
        />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[130px] pb-24 sm:pt-[146px] sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Discover and Complete</span>
              <span className="block text-black mt-3">Web3 Bounties</span>
            </h1>
            <p className="mt-10 text-xl text-gray-500 max-w-2xl mx-auto">
              Earn rewards by solving challenges in the web3 ecosystem. Find opportunities that match your skills and
              get paid for your contributions.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/bounties">
                <Button size="lg" className="h-14 px-8 text-base font-medium flex items-center gap-2">
                  Explore Bounties
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 py-3 px-4 mb-6 max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Total Rewards</span>
                  <span className="text-xl font-bold">$1.3M+</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Active Bounties</span>
                  <span className="text-xl font-bold">349+</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Wallet className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Total Value</span>
                  <span className="text-xl font-bold">$424K+</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Contributors</span>
                  <span className="text-xl font-bold">12.5K+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bounties Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Bounties</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Check out these high-impact opportunities with attractive rewards
            </p>
          </div>

          <FeaturedBounties bounties={featuredBounties} />

          <div className="mt-12 text-center">
            <Link href="/bounties">
              <Button variant="outline" size="lg" className="h-12 px-8">
                View All Bounties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Winners and Activities Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Winners */}
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Recent Winners</h2>
                <p className="mt-2 text-gray-500">Congratulations to our latest bounty winners</p>
              </div>
              <div className="flex-1 flex">
                <RecentWinners winners={winners.slice(0, 4)} />
              </div>
            </div>

            {/* Recent Activities */}
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
                <p className="mt-2 text-gray-500">Stay updated with the latest platform activities</p>
              </div>
              <div className="flex-1 flex">
                <RecentActivities activities={activities.slice(0, 6)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Complete bounties in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Browse Bounties</h3>
              <p className="text-gray-500">
                Explore available bounties and find ones that match your skills and interests.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Your Work</h3>
              <p className="text-gray-500">Complete the task according to requirements and submit your solution.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get Rewarded</h3>
              <p className="text-gray-500">
                Once your submission is approved, receive payment directly to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <span className="block">Ready to start earning?</span>
                </h2>
                <p className="mt-4 text-lg text-gray-300 max-w-3xl">
                  Join our community of contributors and start completing bounties today.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <Link href="/bounties">
                  <Button size="lg" className="h-14 px-8 text-base font-medium bg-white text-black hover:bg-gray-100">
                    Find Bounties
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
