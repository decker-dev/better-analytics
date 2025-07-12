import { notFound } from "next/navigation";
import { TempSiteDemo } from "./_components/temp-site-demo";
import { getDemoSiteBySlug } from "@/lib/unified-sites";

interface TempSitePageProps {
  params: Promise<{ site_slug: string }>;
}

export default async function TempSitePage({ params }: TempSitePageProps) {
  const { site_slug: slug } = await params;
  const tempSite = await getDemoSiteBySlug(slug);

  if (!tempSite) {
    notFound();
  }

  return <TempSiteDemo tempSite={tempSite} slug={slug} />;
}
