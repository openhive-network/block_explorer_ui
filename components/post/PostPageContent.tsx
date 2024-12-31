import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import usePostContent from "@/hooks/api/postPage/usePostContent";
import PostContentCard from "./PostContentCard";
import PostPropertiesTable from "./PostPropertiesTable";
import VoteDetailsTable from "./VoteDetailsTable";

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

  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isVoteDetailsOpen, setIsVoteDetailsOpen] = useState(false);

  const handlePropertiesToggle = () => setIsPropertiesOpen(!isPropertiesOpen);
  const handleVoteDetailsToggle = () =>
    setIsVoteDetailsOpen(!isVoteDetailsOpen);

  if (!data) return;

  const { title, author, active_votes } = data;

  return (
    <div className="w-full h-full p-10">
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

      <PostContentCard
        isPropertiesOpen={isPropertiesOpen}
        isVoteDetailsOpen={isVoteDetailsOpen}
        handlePropertiesToggle={handlePropertiesToggle}
        handleVoteDetailsToggle={handleVoteDetailsToggle}
        data={data}
      />
      <PostPropertiesTable
        isPropertiesOpen={isPropertiesOpen}
        data={data}
      />
      <VoteDetailsTable
        isVoteDetailsOpen={isVoteDetailsOpen}
        voteDetails={active_votes}
      />
    </div>
  );
};

export default PostPageContent;
