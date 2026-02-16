import { StorySession } from "@/components/story/story-session";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StorySession projectId={id} />;
}
