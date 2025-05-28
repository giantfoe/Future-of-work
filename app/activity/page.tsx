import { getRecentActivities } from "@/lib/airtable"
import RecentActivities from "@/components/recent-activities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ActivityPage() {
  const activities = await getRecentActivities()

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Platform Activity</h1>
          <p className="text-gray-500">Stay updated with the latest happenings on the platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivities activities={activities} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
