import { useRouter } from "next/router";
import Link from "next/link";

import usePostContent from "@/hooks/api/postPage/usePostContent";
import usePostContentReplies from "@/hooks/api/postPage/usePostContentReplies";
import PostContent from "./PostContent";
import PostComments from "./PostComments";

const HIVE_BLOG_URL = "https://hive.blog";
const PEAKD_URL = "https://peakd.com";
const ECENCY_URL = "https://ecency.com";

const PostPageContent = () => {
  const router = useRouter();
  const { post } = router.query;
  const accountName = post?.[1] ?? "";
  const permlink = post?.[2] ?? "";
  const path = router.asPath;

  const { data } = usePostContent(accountName, permlink);
  const { data: postReplies } = usePostContentReplies(accountName, permlink);

  if (!data) return;

  const { title, author, active_votes } = data;

  return (
    <div className="w-full h-full px-10">
      <div className="mb-10">
        <div className="text-3xl my-5">
          {title} by {author}
        </div>
        <div className="flex gap-2">
          View this thread on:
          <Link
            className="text-link"
            href={HIVE_BLOG_URL + path}
            target="_blank"
          >
            hive.blog
          </Link>{" "}
          |
          <Link
            className="text-link"
            href={PEAKD_URL + path}
            target="_blank"
          >
            peakd.com
          </Link>{" "}
          |
          <Link
            className="text-link"
            href={ECENCY_URL + path}
            target="_blank"
          >
            ecency.com
          </Link>
        </div>
      </div>
      <PostContent
        active_votes={active_votes}
        data={data}
      />
      {postReplies && postReplies.length && (
        <PostComments comments={postReplies} />
      )}
    </div>
  );
};

export default PostPageContent;
