import Link from "next/link"

export default function WebhookSetupPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[800px] mx-auto">
        <div className="mb-8">
          <Link href="/setup" className="text-primary hover:underline mb-4 inline-flex items-center">
            ← Back to Setup
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Webhook Setup Guide</h1>
          <p className="text-gray-500">
            Learn how to set up webhooks to automatically sync Airtable changes with your application.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Using Zapier</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li>
              <p className="font-medium">Create a new Zap in Zapier</p>
              <p className="text-sm text-gray-500 ml-6">
                Go to{" "}
                <a
                  href="https://zapier.com/app/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Zapier
                </a>{" "}
                and create a new Zap.
              </p>
            </li>
            <li>
              <p className="font-medium">Choose Airtable as the Trigger</p>
              <p className="text-sm text-gray-500 ml-6">
                Select "Airtable" as the trigger app and "New or Modified Record" as the trigger event.
              </p>
            </li>
            <li>
              <p className="font-medium">Connect your Airtable account</p>
              <p className="text-sm text-gray-500 ml-6">
                Connect your Airtable account and select the base and table you want to monitor.
              </p>
            </li>
            <li>
              <p className="font-medium">Set up the Action</p>
              <p className="text-sm text-gray-500 ml-6">
                Choose "Webhooks by Zapier" as the action app and "POST" as the action event.
              </p>
            </li>
            <li>
              <p className="font-medium">Configure the webhook</p>
              <p className="text-sm text-gray-500 ml-6">
                Set the URL to your webhook endpoint:{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">https://your-domain.com/api/webhook/airtable</code>
              </p>
              <p className="text-sm text-gray-500 ml-6 mt-1">
                Add a header:{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization: Bearer your-webhook-secret</code>
              </p>
            </li>
            <li>
              <p className="font-medium">Test and activate your Zap</p>
              <p className="text-sm text-gray-500 ml-6">Test the Zap to make sure it works, then turn it on.</p>
            </li>
          </ol>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Using Make (Integromat)</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li>
              <p className="font-medium">Create a new Scenario in Make</p>
              <p className="text-sm text-gray-500 ml-6">
                Go to{" "}
                <a
                  href="https://www.make.com/en/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Make
                </a>{" "}
                and create a new Scenario.
              </p>
            </li>
            <li>
              <p className="font-medium">Add an Airtable module</p>
              <p className="text-sm text-gray-500 ml-6">
                Add an Airtable module and select "Watch Records" as the action.
              </p>
            </li>
            <li>
              <p className="font-medium">Configure the Airtable connection</p>
              <p className="text-sm text-gray-500 ml-6">
                Connect your Airtable account and select the base and table you want to monitor.
              </p>
            </li>
            <li>
              <p className="font-medium">Add an HTTP module</p>
              <p className="text-sm text-gray-500 ml-6">
                Add an HTTP module after the Airtable module and select "Make a request" as the action.
              </p>
            </li>
            <li>
              <p className="font-medium">Configure the HTTP request</p>
              <p className="text-sm text-gray-500 ml-6">
                Set the URL to your webhook endpoint:{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">https://your-domain.com/api/webhook/airtable</code>
              </p>
              <p className="text-sm text-gray-500 ml-6 mt-1">
                Set the method to POST and add a header:{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization: Bearer your-webhook-secret</code>
              </p>
            </li>
            <li>
              <p className="font-medium">Schedule and activate your Scenario</p>
              <p className="text-sm text-gray-500 ml-6">Set a schedule for your Scenario and activate it.</p>
            </li>
          </ol>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <p className="text-gray-700 mb-4">
            Add the following environment variable to your{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file:
          </p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm font-mono">
            WEBHOOK_SECRET=your-webhook-secret
          </pre>
          <p className="text-gray-500 mt-2">
            Replace <code className="bg-gray-100 px-1 py-0.5 rounded">your-webhook-secret</code> with a secure random
            string.
          </p>
        </div>
      </div>
    </div>
  )
}
