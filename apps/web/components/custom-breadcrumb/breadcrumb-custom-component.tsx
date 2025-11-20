import { UserRoundPen } from "lucide-react";
import { JSX, ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

interface BreadcrumbItemType {
  link: string;
  text: string;
}

interface CustomBreadcrumbProps {
  id?: string;
  icon?: ReactNode;
  items?: BreadcrumbItemType[];
  showEdit?: boolean;
  showView?: boolean;
}

export const CustomBreadcrumb = ({
  id,
  icon,
  items = [],
  showEdit = false,
  showView = false,
}: CustomBreadcrumbProps): JSX.Element => {
  return (
    <div className="flex items-center gap-2 text-sm mb-6 border-b pb-4">
      <div className="p-2 border rounded">
        {icon || <UserRoundPen className="h-4 w-4" />}
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink href={item.link}>{item.text}</BreadcrumbLink>
              </BreadcrumbItem>

              {(index < items.length - 1 || showEdit || showView) && (
                <BreadcrumbSeparator />
              )}
            </React.Fragment>
          ))}

          {showEdit && (
            <>
              <BreadcrumbItem>
                <span className="text-gray-600">Edit</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-gray-600">{id}</span>
              </BreadcrumbItem>
            </>
          )}

          {showView && (
            <>
              <BreadcrumbItem>
                <span className="text-gray-600">View</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-gray-600">{id}</span>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
