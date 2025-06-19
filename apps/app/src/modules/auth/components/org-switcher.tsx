"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrgSlug: string;
}

export const OrgSwitcher = ({
  organizations,
  currentOrgSlug,
}: OrgSwitcherProps) => {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState(currentOrgSlug);

  // Sync with prop changes
  useEffect(() => {
    setSelectedSlug(currentOrgSlug);
  }, [currentOrgSlug]);

  const handleOrgChange = (newSlug: string) => {
    setSelectedSlug(newSlug);
    if (newSlug !== currentOrgSlug) {
      router.push(`/${newSlug}/stats`);
    }
  };

  return (
    <select
      className="border border-input rounded px-3 py-1 text-sm bg-background text-foreground"
      value={selectedSlug}
      onChange={(e) => handleOrgChange(e.target.value)}
    >
      {organizations.map((org) => (
        <option key={org.id} value={org.slug}>
          {org.name}
        </option>
      ))}
    </select>
  );
};
