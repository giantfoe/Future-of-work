import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Users, Wallet, Target } from "lucide-react"
import FeaturedBounties from "@/components/featured-bounties"
import RecentWinners from "@/components/recent-winners"
import RecentActivities from "@/components/recent-activities"
import FuturisticBackground from "@/components/FuturisticBackground"
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <FuturisticBackground />
        {/* Background Pattern */}


        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[190px] pb-24 sm:pt-[186px] sm:pb-32 z-20"> {/* TEXT&CARDS - Top Layer */}
          <div className="max-w-3xl text-left">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              <span className="block">Discover and</span>
              <span className="block">Complete</span>
              <span className="block text-foreground mt-3">Web3 Bounties</span>
            </h1>
            <p className="mt-10 text-xl text-muted-foreground">
              Earn rewards by solving challenges in the web3 ecosystem. Find opportunities that match your skills and
              get paid for your contributions.
            </p>
            <div className="mt-10 flex">
              <Link href="/bounties">
                <Button variant="default" size="lg" className="h-14 px-8 text-base flex items-center gap-2 opacity-70 backdrop-blur-md bg-background/60 border-radius=10">
                  Explore Bounties
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="glass-card rounded-xl py-6 px-8 mb-12 max-w-5xl mx-auto mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500 flex-shrink-0" />
                <div className="flex flex-col items-center">
                  <span className="text-sm uppercase tracking-wider text-muted-foreground">Total Rewards</span>
                  <span className="text-2xl font-bold text-foreground">$1.3M+</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3">
                <Target className="h-8 w-8 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col items-center">
                  <span className="text-sm uppercase tracking-wider text-muted-foreground">Active Bounties</span>
                  <span className="text-2xl font-bold text-foreground">349+</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3">
                <Wallet className="h-8 w-8 text-purple-500 flex-shrink-0" />
                <div className="flex flex-col items-center">
                  <span className="text-sm uppercase tracking-wider text-muted-foreground">Total Value</span>
                  <span className="text-2xl font-bold text-foreground">$424K+</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3">
                <Users className="h-8 w-8 text-orange-500 flex-shrink-0" />
                <div className="flex flex-col items-center">
                  <span className="text-sm uppercase tracking-wider text-muted-foreground">Contributors</span>
                  <span className="text-2xl font-bold text-foreground">12.5K+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bounties Section */}
      <section className="py-16 sm:py-24 relative z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Bounties</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Check out these high-impact opportunities with attractive rewards
            </p>
          </div>

          <FeaturedBounties bounties={featuredBounties} />

          <div className="mt-12 text-center">
            <Link href="/bounties">
              <Button size="lg" className="h-12 px-8 bg-white text-black border border-gray-300 hover:bg-gray-50">
                View All Bounties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Winners and Activities Section */}
      <section className="bg-background py-16 sm:py-24 relative z-20 opacity-70 backdrop-blur-md ">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Winners */}
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Recent Winners</h2>
                <p className="mt-2 text-muted-foreground">Congratulations to our latest bounty winners</p>
              </div>
              <div className="flex-1 flex">
                <RecentWinners winners={winners.slice(0, 4)} />
              </div>
            </div>

            {/* Recent Activities */}
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Recent Activities</h2>
                <p className="mt-2 text-muted-foreground">Stay updated with the latest platform activities</p>
              </div>
              <div className="flex-1 flex">
                <RecentActivities activities={activities.slice(0, 6)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 relative z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white-900">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Complete bounties in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-lg text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full glass-card mb-6">
                <span className="text-2xl font-bold text-foreground">1</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Browse Bounties</h3>
              <p className="text-foreground">
                Explore available bounties and find ones that match your skills and interests.
              </p>
            </div>

            <div className="glass-card p-8 rounded-lg text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full glass-card mb-6">
                <span className="text-2xl font-bold text-foreground">2</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Submit Your Work</h3>
              <p className="text-foreground">Complete the task according to requirements and submit your solution.</p>
            </div>

            <div className="glass-card p-8 rounded-lg text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full glass-card mb-6">
                <span className="text-2xl font-bold text-foreground">3</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Get Rewarded</h3>
              <p className="text-foreground">
                Once your submission is approved, receive payment directly to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FBF6E8] rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#091C2E] sm:text-4xl">
                  <span className="block">Ready to start earning?</span>
                </h2>
                <p className="mt-4 text-lg text-[#091C2E] max-w-3xl">
                  Join our community of contributors and start completing bounties today.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <Link href="/bounties">
                  <Button size="lg" className="h-14 px-8 text-base font-medium bg-[#091C2E] text-[#FBF6E8] rounded-lg">
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
