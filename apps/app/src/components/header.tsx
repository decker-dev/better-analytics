"use client";

import { ChartNoAxesColumnIncreasing, ChevronsUpDown } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import SettingsMenu from "./settings-menu";
import UserMenu from "./user-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Button } from "@repo/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@repo/ui/components/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "#", label: "Dashboard" },
  { href: "#", label: "Docs" },
  { href: "#", label: "API reference" },
];

interface HeaderOrganization {
  id: string;
  name: string;
  slug: string;
}

interface HeaderSite {
  id: string;
  name: string;
  siteKey: string;
}

interface SiteApiResponse {
  id: string;
  name: string;
  siteKey: string;
}

interface HeaderProps {
  organizations: HeaderOrganization[];
  currentOrg?: HeaderOrganization;
  sites?: HeaderSite[];
}

function ClientHeader({ organizations, currentOrg, sites }: HeaderProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const [internalSites, setInternalSites] = useState<HeaderSite[]>(sites || []);
  const [internalCurrentSite, setInternalCurrentSite] =
    useState<HeaderSite | null>(null);
  const [loading, setLoading] = useState(false);

  // Detect if we're in a site context
  const siteKey = params?.siteKey as string | undefined;
  const isInSiteContext = !!siteKey;

  // Manage sites and current site detection
  useEffect(() => {
    if (sites) {
      setInternalSites(sites);

      // If we're in site context, find the current site from the provided sites
      if (isInSiteContext && siteKey) {
        const current = sites.find((s) => s.siteKey === siteKey);
        setInternalCurrentSite(current || null);
      } else {
        setInternalCurrentSite(null);
      }
    } else if (isInSiteContext && currentOrg && siteKey) {
      // Fallback: fetch sites if not provided (shouldn't happen with server component)
      setLoading(true);

      fetch(`/api/sites?orgId=${currentOrg.id}`)
        .then((res) => res.json())
        .then((sitesData: SiteApiResponse[]) => {
          const mappedSites = sitesData.map((s) => ({
            id: s.id,
            name: s.name,
            siteKey: s.siteKey,
          }));
          setInternalSites(mappedSites);

          const current = mappedSites.find((s) => s.siteKey === siteKey);
          setInternalCurrentSite(current || null);
        })
        .catch((error) => {
          console.error("Failed to fetch sites:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setInternalSites([]);
      setInternalCurrentSite(null);
    }
  }, [isInSiteContext, currentOrg, siteKey, sites]);

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
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink href={link.href} className="py-1.5">
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          {/* Breadcrumb */}
          <ChartNoAxesColumnIncreasing size={16} />
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
              {isInSiteContext && internalCurrentSite && !loading && (
                <>
                  <BreadcrumbSeparator> / </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <div className="flex items-center gap-1">
                      {/* Site Title Link */}
                      <Link
                        href={`/${currentOrg?.slug}/sites/${internalCurrentSite.siteKey}/stats`}
                        className="text-foreground hover:text-primary font-medium transition-colors"
                      >
                        {internalCurrentSite.name}
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
                          {internalSites.map((site) => (
                            <DropdownMenuItem
                              key={site.id}
                              onClick={() => handleSiteChange(site.siteKey)}
                              className={
                                internalCurrentSite?.id === site.id
                                  ? "bg-accent"
                                  : ""
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

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Nav menu */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            {/* Settings */}
            <SettingsMenu />
          </div>
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default ClientHeader;
