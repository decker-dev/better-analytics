import Onboarding from "@/modules/onboarding/components/onboarding";

interface NewSitePageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function NewSitePage({ params }: NewSitePageProps) {
  const { orgSlug } = await params;

  // Middleware has already validated session and org access
  return (
    <div className="p-6">
      <Onboarding />
    </div>
  );
}
