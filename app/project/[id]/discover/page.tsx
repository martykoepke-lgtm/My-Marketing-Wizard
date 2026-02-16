import { WizardShell } from "@/components/wizard/wizard-shell";

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WizardShell projectId={id} />;
}
