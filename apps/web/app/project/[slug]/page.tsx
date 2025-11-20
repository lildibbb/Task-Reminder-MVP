"use client";

import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";
import { CircleUserRound } from "lucide-react";

export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="container mx-auto py-6 px-4">
      <CustomBreadcrumb
        icon={<CircleUserRound className="h-4 w-4" />}
        items={[
          { link: "/project", text: "Projects" },
          { link: "/project", text: "List Projects" },
          { link: `/project/${slug}`, text: slug },
        ]}
      />
    </div>
  );
}
