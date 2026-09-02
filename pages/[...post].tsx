//Handle post page routes either /{community}/{accountName}/{permlink} or /{accountName}/{permlink}

import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Loader2 } from "lucide-react";

import { SeoMeta, noindexMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";

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
// an indexable soft-404.
//
// Post pages are noindex by decision, not pending work. The same post is served
// by hive.blog, peakd and ecency, which will win that ranking; indexing millions
// of near-duplicate posts here would dilute the domain's quality signal and drag
// down the pages that are actually ours (witnesses, proposals, top holders,
// accounts, blocks). The route stays for click-through from an operation — it is
// just not a search entry point. Do not "finish" this by adding meta.
export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res, params }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const segments = Array.isArray(params?.post) ? params!.post : [];
  // Keep "@" literal: %40 would be a different URL to a crawler than /@account emits.
  const path = `/${segments
    .map((s) => encodeURIComponent(s).replace(/%40/g, "@"))
    .join("/")}`;
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
