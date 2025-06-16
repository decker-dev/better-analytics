"use client";

import { useRouter } from "next/navigation";

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

  const handleOrgChange = (newSlug: string) => {
    if (newSlug !== currentOrgSlug) {
      router.push(`/${newSlug}/dashboard`);
    }
  };

  return (
    <select
      className="border rounded px-3 py-1 text-sm"
      defaultValue={currentOrgSlug}
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
