import { redirect } from "next/navigation";

interface OrgRootPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgRootPage({ params }: OrgRootPageProps) {
  const { orgSlug } = await params;

  // Middleware has already validated auth and org access
  // Just redirect to sites management page
  redirect(`/${orgSlug}/sites`);
}
