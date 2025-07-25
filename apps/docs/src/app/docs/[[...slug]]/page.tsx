import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import { Rate } from "@/components/rate";
import { LLMCopyButton, ViewOptions } from "./page-client";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  // Generate URLs for the buttons
  const markdownUrl = `/docs/${(params.slug || []).join("/")}`;
  const githubUrl = `https://github.com/decker-dev/better-analytics/blob/main/apps/docs/content/docs/${(params.slug || []).join("/")}.mdx`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="flex flex-col gap-2 mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex items-center gap-2 pb-6">
        <LLMCopyButton slug={params.slug || []} />
        <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        <Rate
          onRateAction={async (url, feedback) => {
            "use server";

            // Simple console logging for now - you can replace this with your preferred analytics
            console.log("Feedback received:", { url, feedback });

            // Return a mock response - replace with actual implementation
            return {
              githubUrl: "https://github.com/your-repo/discussions",
            };
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const image = ["/docs-og", ...(params.slug || []), "image.png"].join("/");

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      images: image,
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      images: image,
    },
  };
}
