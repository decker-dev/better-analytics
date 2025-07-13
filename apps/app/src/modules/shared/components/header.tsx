"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import UserMenu from "./user-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import Image from "next/image";

interface HeaderOrganization {
  id: string;
  name: string;
  slug: string;
}

interface HeaderSite {
  id: string;
  name: string;
  slug: string;
}

interface HeaderProps {
  organizations: HeaderOrganization[];
  currentOrg?: HeaderOrganization;
  sites?: HeaderSite[];
}

export default function Header({
  organizations,
  currentOrg,
  sites,
}: HeaderProps) {
  const router = useRouter();
  const params = useParams();

  const [currentSite, setCurrentSite] = useState<HeaderSite | null>(null);

  // Get URL parameters
  const orgSlug = params?.orgSlug as string | undefined;
  const siteSlug = params?.slug as string | undefined;

  // Detect if we're in a site context
  const isInSiteContext = !!siteSlug;

  // Find current site based on URL slug
  useEffect(() => {
    if (isInSiteContext && siteSlug && sites) {
      // Find site by siteKey matching the slug from URL
      const current = sites.find((site) => site.slug === siteSlug);
      setCurrentSite(current || null);
    } else {
      setCurrentSite(null);
    }
  }, [isInSiteContext, siteSlug, sites]);

  const handleOrgChange = (orgSlug: string) => {
    router.push(`/${orgSlug}/sites`);
  };

  const handleSiteChange = (newSiteKey: string) => {
    if (currentOrg) {
      router.push(`/${currentOrg.slug}/sites/${newSiteKey}/stats`);
    }
  };

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Breadcrumb */}
          <Image
            src="/logo.svg"
            alt="Better Analytics"
            width={24}
            height={24}
          />
          <Breadcrumb>
            <BreadcrumbList>
              {/* Organization */}
              <BreadcrumbItem>
                <div className="flex items-center gap-1">
                  {/* Organization Title Link */}
                  <Link
                    href={`/${currentOrg?.slug}/sites`}
                    className="text-foreground hover:text-primary font-medium transition-colors"
                  >
                    {currentOrg?.name || "Organization"}
                  </Link>

                  {/* Organization Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full shadow-none h-6 w-6"
                        aria-label="Switch organization"
                      >
                        <ChevronsUpDown size={14} aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      {organizations.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={() => handleOrgChange(org.slug)}
                          className={
                            currentOrg?.id === org.id ? "bg-accent" : ""
                          }
                        >
                          {org.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </BreadcrumbItem>

              {/* Site - Only show in site context */}
              {isInSiteContext && currentSite && (
                <>
                  <BreadcrumbSeparator> / </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <div className="flex items-center gap-1">
                      {/* Site Title Link */}
                      <Link
                        href={`/${currentOrg?.slug}/sites/${currentSite.slug}/stats`}
                        className="text-foreground hover:text-primary font-medium transition-colors"
                      >
                        {currentSite.name}
                      </Link>

                      {/* Site Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full shadow-none h-6 w-6"
                            aria-label="Switch site"
                          >
                            <ChevronsUpDown size={14} aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          {sites?.map((site) => (
                            <DropdownMenuItem
                              key={site.id}
                              onClick={() => handleSiteChange(site.slug)}
                              className={
                                currentSite?.id === site.id ? "bg-accent" : ""
                              }
                            >
                              {site.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-4">
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
