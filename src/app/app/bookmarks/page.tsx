import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBookmarks } from "@/lib/api/server-queries";
import BookmarksList from "./BookmarksList";

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?redirectTo=/app/bookmarks");
  }

  const bookmarks = await getUserBookmarks(session.user.id, 50);

  return <BookmarksList initialBookmarks={bookmarks} />;
}
