import { notFound } from "next/navigation";
import { TempSiteDemo } from "./temp-site-demo";
import { getTempSiteBySlug } from "@/lib/unified-sites";

interface TempSitePageProps {
  params: Promise<{ temporal_id: string }>;
}

export default async function TempSitePage({ params }: TempSitePageProps) {
  const { temporal_id: slug } = await params;
  const tempSite = await getTempSiteBySlug(slug);

  if (!tempSite) {
    notFound();
  }

  return <TempSiteDemo tempSite={tempSite} slug={slug} />;
}
