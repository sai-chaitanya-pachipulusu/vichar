"use client";

import { useParams, useSearchParams } from "next/navigation";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { useWorkspace } from "@/hooks/useWorkspace";
import WorkspaceContent from "./WorkspaceContent";

export default function WorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const title = searchParams.get("title") || "Research Workspace";

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      enableInspector={false}
    >
      <WorkspaceInner projectId={projectId} title={title} />
    </CopilotKit>
  );
}

function WorkspaceInner({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  const workspace = useWorkspace();

  return (
    <WorkspaceContent
      projectId={projectId}
      title={title}
      workspace={workspace}
    />
  );
}
