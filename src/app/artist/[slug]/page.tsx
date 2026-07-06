import { redirect } from "next/navigation";

export default async function LegacyArtistRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/artists/${slug}`);
}
