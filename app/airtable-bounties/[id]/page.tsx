import AirtableBountyDetail from "@/components/airtable-bounty-detail"

export const metadata = {
  title: "Bounty Details | Bounty Platform",
  description: "View details and submit applications for bounties from Airtable",
}

export default function AirtableBountyDetailPage({ params }: { params: { id: string } }) {
  return <AirtableBountyDetail bountyId={params.id} />
}
