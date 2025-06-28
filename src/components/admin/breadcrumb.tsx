"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  title: string;
  link?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
          {item.link ? (
            <Link
              href={item.link}
              className="transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.title}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
