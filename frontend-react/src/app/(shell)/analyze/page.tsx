"use client";

import dynamic from "next/dynamic";
import { PanelSkeleton } from "@/components/ui/skeleton";

const InvestigationWorkspace = dynamic(
  () => import("@/components/investigation/investigation-workspace").then((m) => ({ default: m.InvestigationWorkspace })),
  { loading: () => <PanelSkeleton /> }
);

export default function AnalyzePage() {
  return <InvestigationWorkspace />;
}
