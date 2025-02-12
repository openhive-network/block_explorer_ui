//Handle post page routes either /{community}/{accountName}/{permlink} or /{accountName}/{permlink}

import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import PageNotFound from "@/components/PageNotFound";
import PostPageContent from "@/components/post/PostPageContent";
import usePostDiscussion from "@/hooks/api/postPage/usePostDiscussion";

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

    return <PostPageContent />;
  } else if (post.length === 3) {
    return <PostPageContent />;
  } else {
    return <PageNotFound />;
  }
};
export default Post;
