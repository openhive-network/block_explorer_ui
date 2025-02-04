//Handle post page routes either /{community}/{accountName}/{permlink} or /{accountName}/{permlink}

import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import PageNotFound from "@/components/PageNotFound";
import PostPageContent from "@/components/post/PostPageContent";
import usePostContent from "@/hooks/api/postPage/usePostContent";

const Post = () => {
  const router = useRouter();
  const getContent = usePostContent;

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

    const { data, isError, isLoading } = getContent(accountName, permlink);

    if (!isLoading && isError) return <PageNotFound />;
    if (!isLoading && !data) return <PageNotFound />;

    if (isLoading) {
      return (
        <Loader2 className="dark:text-white animate-spin mt-1 h-8 w-8 ml-3 ..." />
      );
    }

    const community = data?.category;
    if (!community) return;

    const url = `${community}/${encodeURI(accountName)}/${permlink}`;

    router.replace(url);

    return <PostPageContent />;
  } else if (post.length === 3) {
    const community = post[0];
    accountName = post[1];
    permlink = post[2];

    const { data, isError, isLoading } = getContent(accountName, permlink);

    if (!isLoading && isError) return <PageNotFound />;
    if (!isLoading && !data) return <PageNotFound />;

    const communityFromRequest = data?.category;

    if (community !== communityFromRequest && !isLoading) {
      return <PageNotFound />;
    }

    if (isLoading) {
      return (
        <Loader2 className="dark:text-white animate-spin mt-1 h-8 w-8 ml-3 ..." />
      );
    }

    return <PostPageContent />;
  } else {
    return <PageNotFound />;
  }
};

export default Post;
