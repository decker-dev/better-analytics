import { notFound } from "next/navigation";
import { TempSiteDemo } from "./temp-site-demo";
import { getTemporarySite } from "../actions";

interface TempSitePageProps {
  params: Promise<{ temporal_id: string }>;
}

export default async function TempSitePage({ params }: TempSitePageProps) {
  const { temporal_id } = await params;
  const result = await getTemporarySite(temporal_id);

  if (!result.success || result.error) {
    notFound();
  }

  return <TempSiteDemo tempSite={result.data} tempId={temporal_id} />;
}
