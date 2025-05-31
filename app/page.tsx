import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Users, Wallet, Target, Zap, Globe, Award, CheckCircle, TrendingUp, Code, Shield, Star, Clock, Play, BarChart3, Rocket, Building, FileText, Activity } from "lucide-react"
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
    <div className="min-h-screen text-white">
      <FuturisticBackground />
      
      {/* Bold Hero Section */}
      <section className="relative section-dark py-20 lg:py-32">
        {/* Architectural background grid - same as original hero */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden architectural-grid opacity-15"></div>
        
        {/* Subtle flowing lines */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="heroLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0"/>
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            <path d="M0,400 Q600,350 1200,400" stroke="url(#heroLineGradient)" strokeWidth="1" fill="none">
              <animate attributeName="d" 
                values="M0,400 Q600,350 1200,400;M0,420 Q600,370 1200,420;M0,400 Q600,350 1200,400" 
                dur="20s" repeatCount="indefinite"/>
            </path>
            <path d="M0,300 Q600,250 1200,300" stroke="url(#heroLineGradient)" strokeWidth="0.5" fill="none" opacity="0.5">
              <animate attributeName="d" 
                values="M0,300 Q600,250 1200,300;M0,320 Q600,270 1200,320;M0,300 Q600,250 1200,300" 
                dur="25s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[600px]">
            
            {/* Left side - Bold Typography */}
            <div className="space-y-10 z-10 relative">
              <div className="space-y-8">
                <h1 className="text-6xl lg:text-7xl font-black leading-[0.9] text-reveal">
                  The Future of{" "}
                  <span className="accent-text block">Work is here</span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl font-medium">
                  Join the most innovative Web3 builders completing high-impact bounties. 
                  From DeFi protocols to NFT marketplaces - shape the decentralized future.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/bounties">
                  <Button 
                    size="lg" 
                    className="h-14 px-10 text-lg font-bold btn-primary"
                  >
                    Start Building
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Large Geometric Element + Metric Dashboard Cards */}
            <div className="relative z-10 h-[600px]">
              
              {/* Large animated blobs - inspired by Pipeline */}
              <div className="absolute top-16 right-0 hero-blob hero-blob opacity-80" style={{ background: 'rgba(96, 165, 250, 0.2)', width: '500px', height: '500px' }}></div>
              <div className="absolute bottom-16 right-32 hero-blob-2 opacity-60" style={{ background: 'rgba(34, 211, 238, 0.15)', width: '300px', height: '300px' }}></div>
              <div className="absolute top-1/2 left-1/4 hero-blob opacity-40" style={{ background: 'rgba(139, 92, 246, 0.12)', width: '200px', height: '200px', animationDelay: '10s' }}></div>
              
              {/* Community Earnings Card - Top Right */}
              <div className="absolute top-20 right-8 dashboard-card metric-card-earnings w-64">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                </div>
                <div className="text-4xl font-black text-green-400 mb-1">$34k+</div>
                <div className="text-sm text-gray-300 font-medium mb-3">Community Earnings</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700/50 rounded-full h-1">
                    <div className="bg-green-400 h-1 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                  <span className="text-xs text-green-400 font-medium">+23% this week</span>
                </div>
              </div>

              {/* Active Bounties Card - Top Left */}
              <div className="absolute top-8 left-8 dashboard-card metric-card-bounties w-60">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                </div>
                <div className="text-4xl font-black text-blue-400 mb-1">250+</div>
                <div className="text-sm text-gray-300 font-medium mb-3">Active Bounties</div>
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`w-full h-1 rounded-full ${i < 6 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  ))}
                </div>
              </div>

              {/* Total Submissions Card - Bottom Right */}
              <div className="absolute bottom-2 right-8 dashboard-card metric-card-submissions w-64">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xs text-purple-400 font-medium">Live Count</div>
                </div>
                <div className="text-4xl font-black text-purple-400 mb-1">1.5k+</div>
                <div className="text-sm text-gray-300 font-medium mb-3">Total Submissions</div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-purple-500 border-2 border-gray-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-purple-400">+12 today</span>
                </div>
              </div>

              {/* Total Participants Card - Bottom Left */}
              <div className="absolute bottom-8 left-8 dashboard-card metric-card-participants w-60">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-orange-400 animate-pulse" />
                </div>
                <div className="text-4xl font-black text-orange-400 mb-1">400+</div>
                <div className="text-sm text-gray-300 font-medium mb-3">Unique Participants</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                      <Users className="h-4 w-4 text-orange-400" />
                    </div>
                    <span className="text-xs text-orange-400">Growing daily</span>
                  </div>
                  <div className="text-xs text-gray-400">+5 this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Angled Earnings Banner */}
      <section className="relative overflow-hidden bg-gray-900/95 transform -skew-y-1 py-20 my-12">
        {/* Grid lines passing through */}
        <div className="absolute inset-0 architectural-grid opacity-30"></div>
        
        <div className="transform skew-y-1">
          {/* Scrolling Text Container */}
          <div className="relative overflow-hidden whitespace-nowrap">
            <div className="animate-scroll-slow inline-block">
              <div className="flex items-center gap-16 text-white font-black text-3xl md:text-4xl lg:text-5xl">
                <span className="flex items-center gap-4">
                  <DollarSign className="h-10 w-10 md:h-12 md:w-12" />
                  Start Earning in Dollars
                </span>
                <span>•</span>
                <span>$4k+ Up to be Earned Now</span>
                <span>•</span>
                <span>250+ Active Opportunities</span>
                <span>•</span>
                <span className="flex items-center gap-4">
                  <Target className="h-10 w-10 md:h-12 md:w-12" />
                  Real Payments for Real Contributions
                </span>
                <span>•</span>
                <span>Join 400+ Web3 Builders</span>
                <span>•</span>
                <span className="flex items-center gap-4">
                  <TrendingUp className="h-10 w-10 md:h-12 md:w-12" />
                  $34k+ Community Earnings
                </span>
                <span>•</span>
                <span>Start Earning in Dollars</span>
                <span>•</span>
                <span>$4k+ Up to be Earned Now</span>
                <span>•</span>
                <span>250+ Active Opportunities</span>
                <span>•</span>
                <span>Real Payments for Real Contributions</span>
                <span>•</span>
                <span>Join 400+ Web3 Builders</span>
                <span>•</span>
                <span>$34k+ Community Earnings</span>
                <span>•</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-white/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-white/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/3 w-24 h-24 bg-cyan-300/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-1/4 left-3/4 w-36 h-36 bg-blue-300/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Geometric accent lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>
        </div>
      </section>

      {/* Featured Bounties Section */}
      <section className="section-dark py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-8">
              Featured Opportunities
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover cutting-edge projects with substantial rewards. Perfect for developers, designers, and Web3 innovators.
            </p>
          </div>

          <FeaturedBounties bounties={featuredBounties} />

          <div className="mt-20 text-center">
            <Link href="/bounties">
              <Button 
                size="lg" 
                className="h-14 px-10 text-lg font-bold btn-outline-glass"
              >
                Explore All Opportunities
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Winners and Activities Section */}
      <section className="section-gradient py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Recent Winners */}
            <div className="premium-card p-10">
              <div className="mb-10">
                <h3 className="text-3xl font-bold mb-3">Recent Champions</h3>
                <p className="text-lg text-gray-300">Celebrating our latest bounty winners</p>
              </div>
              <RecentWinners winners={winners.slice(0, 4)} />
            </div>

            {/* Recent Activities */}
            <div className="premium-card p-10">
              <div className="mb-10">
                <h3 className="text-3xl font-bold mb-3">Live Platform Activity</h3>
                <p className="text-lg text-gray-300">Real-time updates from our community</p>
              </div>
              <RecentActivities activities={activities.slice(0, 6)} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-dark py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-8">
              Your path to Web3 success
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to start earning rewards and building your Web3 reputation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center premium-card p-10">
              <div className="w-20 h-20 mx-auto mb-8 rounded-3xl icon-blue flex items-center justify-center">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">Discover Opportunities</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Browse cutting-edge bounties across DeFi, NFTs, DAOs, and emerging Web3 sectors. 
                Find projects that align with your expertise and passion.
              </p>
            </div>

            <div className="text-center premium-card p-10">
              <div className="w-20 h-20 mx-auto mb-8 rounded-3xl icon-blue flex items-center justify-center">
                <span className="text-3xl font-black text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">Build & Submit</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Create innovative solutions following project requirements. Submit your work with 
                comprehensive documentation and live demonstrations.
              </p>
            </div>

            <div className="text-center premium-card p-10">
              <div className="w-20 h-20 mx-auto mb-8 rounded-3xl icon-blue flex items-center justify-center">
                <span className="text-3xl font-black text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">Earn & Grow</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Receive instant payments upon approval. Build your Web3 reputation and 
                unlock exclusive high-value opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-darker py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-10">
            <h2 className="text-5xl font-bold">
              Ready to build the future?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join the most innovative Web3 builders and start earning rewards for your contributions to the decentralized economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/bounties">
                <Button 
                  size="lg" 
                  className="h-14 px-10 text-lg font-bold btn-primary"
                >
                  Start Earning Today
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-10 text-lg font-bold btn-outline-glass"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
