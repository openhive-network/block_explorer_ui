//Handle post page routes either /{community}/{accountName}/{permlink} or /{accountName}/{permlink}

import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Loader2 } from "lucide-react";

import { SeoMeta, noindexMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";

import PageNotFound from "@/components/PageNotFound";
import PostPageContent from "@/components/post/PostPageContent";
import usePostDiscussion from "@/hooks/api/postPage/usePostDiscussion";
import ScrollTopButton from "@/components/ScrollTopButton";

const Post = () => {
  const router = useRouter();
  const getDiscussion = usePostDiscussion;

  let accountName: string = "";
  let permlink: string = "";

  if (!router.isReady) {
    return (
      <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
    );
  }
  // Post query as array
  const { post } = router.query;

  const PostPageLayout = () => (
    <>
      <PostPageContent />
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <ScrollTopButton />
      </div>
    </>
  );

  if (!post || !post.length) {
    return <PageNotFound />;
  }

  if (post.length === 2) {
    accountName = post[0];
    permlink = post[1];

    const { data, isError, isLoading } = getDiscussion(accountName, permlink);

    // Account name must start with "@"
    if (!accountName.startsWith("@")) return <PageNotFound />;
    if (!isLoading && isError) return;
    if (!isLoading && !data) return <PageNotFound />;

    if (isLoading) {
      return (
        <Loader2 className="dark:text-white animate-spin mt-1 h-8 w-8 ml-3 ..." />
      );
    }
    const author = accountName?.replace("@", "");
    const discussionKey = `${author}/${permlink}`;
    const postContent = data?.[discussionKey];

    const community = postContent?.category;

    if (!community) return;

    const url = `${community}/${encodeURI(accountName)}/${permlink}`;

    router.replace(url);

    return <PostPageLayout />;
  } else if (post.length === 3) {
    return <PostPageLayout />;
  } else {
    return <PageNotFound />;
  }
};

// This is the root catch-all: every URL that matches no other route lands here
// and renders PageNotFound with a 200, so without this each junk path would be
// an indexable soft-404. Post pages themselves are noindex for now because they
// still ship no real meta — see the follow-up ticket for title/description/
// Article JSON-LD, which is what should lift this.
export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res, params }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const segments = Array.isArray(params?.post) ? params!.post : [];
  const path = `/${segments.map(encodeURIComponent).join("/")}`;
  return {
    props: {
      meta: noindexMeta(
        req,
        path,
        seoText("seo.post.title"),
        seoText("seo.post.description")
      ),
    },
  };
};

export default Post;
