import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Settings, Users, Shield, Bell } from "lucide-react";
import { OrganizationActions } from "@/modules/auth/components/organization-actions";

interface SettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgSlug } = await params;

  // Get active organization (set by layout)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get organization members
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const currentOrg = organizations?.find((org) => org.slug === orgSlug);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">
          Manage your organization settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue={currentOrg?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Organization Slug
                </label>
                <input
                  type="text"
                  defaultValue={currentOrg?.slug}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Tell us about your organization..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Members</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Projects</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="font-semibold">2.4 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="font-semibold text-blue-600">Pro</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationActions />
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Session Management</h4>
              <p className="text-sm text-gray-600">
                Manage active sessions across devices
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Manage
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">API Keys</h4>
              <p className="text-sm text-gray-600">
                Generate and manage API keys for integrations
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Manage
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive push notifications in your browser
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Reports</h4>
              <p className="text-sm text-gray-600">
                Get weekly analytics summaries
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
