import { getDemoSiteBySlug } from "@/lib/unified-sites";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ site_slug: string }> }
) {
  try {
    const { site_slug } = await params;

    if (!site_slug) {
      return NextResponse.json(
        { error: "Temporary site ID is required" },
        { status: 400 }
      );
    }

    const tempSite = await getDemoSiteBySlug(site_slug);

    if (!tempSite) {
      return NextResponse.json(
        { error: "Temporary site not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tempSite });
  } catch (error) {
    console.error("Error fetching temporary site:", error);
    return NextResponse.json(
      { error: "Failed to fetch temporary site" },
      { status: 500 }
    );
  }
} 