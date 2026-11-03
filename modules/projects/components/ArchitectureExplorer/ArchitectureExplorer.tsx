"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  FiArrowDown,
  FiArrowRight,
  FiCode,
  FiGitBranch,
  FiLayers,
  FiMousePointer,
  FiServer,
} from "react-icons/fi";

import {
  getArchitectureForSlug,
  type ArchitectureFlow,
  type ArchitectureNode,
  type NodeKind,
} from "./architectureData";

const nodeStyles: Record<NodeKind, string> = {
  interface: "border-sky-200 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/25",
  route: "border-violet-200 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/25",
  service: "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20",
  external: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/25",
};

const nodeIcons = {
  interface: FiMousePointer,
  route: FiLayers,
  service: FiServer,
  external: FiGitBranch,
};

function label(id: boolean, text: { id: string; en: string }) {
  return id ? text.id : text.en;
}

function FlowDiagram({ flow, isID }: { flow: ArchitectureFlow; isID: boolean }) {
  const [activeNodeId, setActiveNodeId] = useState(flow.nodes[0]?.id ?? "");
  const activeNode = flow.nodes.find((node) => node.id === activeNodeId) ?? flow.nodes[0];

  // Reset pilihan node jika pengguna mengganti alur.
  useEffect(() => {
    setActiveNodeId(flow.nodes[0]?.id ?? "");
  }, [flow]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {label(isID, flow.title)}
        </h4>
        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {label(isID, flow.description)}
        </p>
      </div>

      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-1">
        {flow.nodes.map((node, index) => {
          const Icon = nodeIcons[node.kind];
          const selected = activeNode?.id === node.id;
          return (
            <div key={node.id} className="flex min-w-0 flex-1 flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-1">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveNodeId(node.id)}
                className={`min-h-[105px] w-full min-w-0 rounded-xl border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${nodeStyles[node.kind]} ${selected ? "ring-2 ring-neutral-500/50 ring-offset-2 dark:ring-neutral-400/50 dark:ring-offset-neutral-950" : "hover:border-neutral-400 dark:hover:border-neutral-600"}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={15} aria-hidden="true" />
                  <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {node.kind === "interface"
                      ? "UI"
                      : node.kind === "route"
                        ? "API / Route"
                        : node.kind === "service"
                          ? "Service"
                          : "External"}
                  </span>
                </div>
                <span className="block text-xs font-semibold leading-relaxed text-neutral-900 dark:text-neutral-100">
                  {label(isID, node.title)}
                </span>
                <span className="mt-1 block truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                  {node.file ?? (isID ? "Pengguna" : "User")}
                </span>
              </button>
              {index < flow.nodes.length - 1 ? (
                <div className="flex shrink-0 justify-center text-neutral-400 dark:text-neutral-600" aria-hidden="true">
                  <FiArrowDown size={16} className="md:hidden" />
                  <FiArrowRight size={16} className="hidden md:block" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {activeNode ? <NodeDetail key={activeNode.id} node={activeNode} isID={isID} /> : null}

      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        <span className="font-medium">{isID ? "Catatan sumber: " : "Source note: "}</span>
        {label(isID, flow.evidence)}
      </p>
    </div>
  );
}

function NodeDetail({ node, isID }: { node: ArchitectureNode; isID: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60" aria-live="polite">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {isID ? "Komponen dipilih" : "Selected component"}
        </span>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label(isID, node.title)}</span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {label(isID, node.description)}
      </p>
      {node.file ? (
        <code className="mt-3 block break-all rounded-lg bg-neutral-100 px-3 py-2 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {node.file}
        </code>
      ) : null}
    </div>
  );
}

export default function ArchitectureExplorer() {
  const params = useParams();
  const locale = useLocale();
  const isID = locale === "id";
  const slugParam = params?.slug;
  const slug = typeof slugParam === "string" ? slugParam : Array.isArray(slugParam) ? slugParam[0] : "";
  const project = getArchitectureForSlug(slug);
  const [activeFlowId, setActiveFlowId] = useState("");

  // Jika proyek belum memiliki data terverifikasi, bagian ini tidak ditampilkan.
  if (!project || project.flows.length === 0) return null;
  const activeFlow = project.flows.find((flow) => flow.id === activeFlowId) ?? project.flows[0];

  return (
    <section aria-labelledby="architecture-explorer-title" className="px-5 pb-8 pt-5 sm:px-6 lg:px-0">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/30 sm:p-6">
        <header className="mb-5 flex items-start gap-3">
          <span className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
            <FiCode size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 id="architecture-explorer-title" className="text-lg font-bold text-neutral-900 dark:text-neutral-100 sm:text-xl">
              Architecture Explorer
            </h2>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {label(isID, project.intro)}
            </p>
          </div>
        </header>

        <div className="mb-5 flex flex-wrap gap-2" aria-label={isID ? "Pilih alur arsitektur" : "Choose an architecture flow"}>
          {project.flows.map((flow) => (
            <button
              key={flow.id}
              type="button"
              aria-pressed={activeFlow.id === flow.id}
              onClick={() => setActiveFlowId(flow.id)}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:text-sm ${activeFlow.id === flow.id ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900" : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}
            >
              {label(isID, flow.title)}
            </button>
          ))}
        </div>

        <FlowDiagram key={activeFlow.id} flow={activeFlow} isID={isID} />
      </div>
    </section>
  );
}
