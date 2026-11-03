import type { ReactNode } from "react";
import ArchitectureExplorer from "@/modules/projects/components/ArchitectureExplorer/ArchitectureExplorer";

// Nested layout: menambahkan eksplorasi arsitektur tanpa mengubah halaman detail yang sudah ada.
export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ArchitectureExplorer />
    </>
  );
}
