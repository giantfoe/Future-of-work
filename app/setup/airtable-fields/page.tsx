import Link from "next/link"

export default function AirtableFieldsSetupPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[800px] mx-auto">
        <div className="mb-8">
          <Link href="/setup" className="text-primary hover:underline mb-4 inline-flex items-center">
            ← Back to Setup
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Airtable Field Names Guide</h1>
          <p className="text-gray-500">
            This guide explains how to set up your Airtable fields to work with the Bounty Platform.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Required Field Names</h2>
          <p className="text-gray-700 mb-4">
            Your Airtable table should have the following field names for the bounty platform to work correctly:
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field Name in Your Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Field Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tiltle</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Title</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    The title of the bounty (currently misspelled as "Tiltle")
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Description</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Description</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    The description of the bounty (correct)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rewards</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Reward</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    The reward amount (currently plural "Rewards")
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Deadline</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Deadline</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">The deadline date (correct)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Category</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Category</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    The category of the bounty (correct)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Select</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Status</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    The status of the bounty (currently named "Select")
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Options</h2>
          <p className="text-gray-700 mb-4">You have two options to fix the field name mismatch:</p>

          <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li>
              <p className="font-medium">Option 1: Rename your Airtable fields (Recommended)</p>
              <p className="text-sm text-gray-500 ml-6">
                Rename the fields in your Airtable to match the expected names. This is the cleanest solution.
              </p>
              <ul className="list-disc list-inside ml-6 mt-2 text-sm text-gray-500">
                <li>Change "Tiltle" to "Title"</li>
                <li>Change "Rewards" to "Reward"</li>
                <li>Change "Select" to "Status"</li>
              </ul>
            </li>
            <li>
              <p className="font-medium">Option 2: Keep using the current code</p>
              <p className="text-sm text-gray-500 ml-6">
                We've updated the code to handle your current field names, so you can keep using them as they are.
              </p>
            </li>
          </ol>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <p className="text-gray-700 mb-4">After making any changes to your Airtable:</p>

          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Restart your development server</li>
            <li>
              Visit the{" "}
              <Link href="/debug/airtable" className="text-primary hover:underline">
                debug page
              </Link>{" "}
              to verify your connection
            </li>
            <li>
              Check the{" "}
              <Link href="/airtable-bounties" className="text-primary hover:underline">
                Airtable Bounties page
              </Link>{" "}
              to see if your bounties are displaying correctly
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
