import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import PostContent from "./PostContent";
import PostComments from "./PostComments";
import usePostDiscussion from "@/hooks/api/postPage/usePostDiscussion";

const HIVE_BLOG_URL = "https://hive.blog";
const PEAKD_URL = "https://peakd.com";
const ECENCY_URL = "https://ecency.com";

const PostPageContent = () => {
  const router = useRouter();

  const { post } = router.query;

  const accountNameFromRoute = post?.[1] as string; // Because of url replacement in [...post].tsx file, first parameter should always be category (community)
  const permlink = post?.[2] as string;

  const { data, isLoading } = usePostDiscussion(accountNameFromRoute, permlink);

  if (isLoading) {
    return (
      <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
    );
  }

  const buildLinkByUrl = (url: string) => {
    return `${url}/${accountNameFromRoute}/${permlink}`;
  };

  const LINKS = [
    { name: "hive.blog", href: buildLinkByUrl(HIVE_BLOG_URL) },
    { name: "peakd.com", href: buildLinkByUrl(PEAKD_URL) },
    { name: "ecency.com", href: buildLinkByUrl(ECENCY_URL) },
  ];

  if (!data) return;

  const accountName = accountNameFromRoute?.replace("@", "");
  const discussionKey = `${accountName}/${permlink}`;
  const postContent = data[discussionKey];

  const { title, author, active_votes } = postContent;

  return (
    <div className="page-container h-full">
      <div className="mb-10">
        <div className="text-3xl my-5">
          {title} by {author}
        </div>
        <div className="flex gap-2">
          View this thread on:
          {LINKS.map(({ name, href }) => {
            return (
              <div key={name}>
                <Link
                  className="text-link"
                  href={href}
                  target="_blank"
                >
                  {name}
                </Link>{" "}
                |
              </div>
            );
          })}
        </div>
      </div>
      <PostContent
        active_votes={active_votes}
        data={postContent}
      />
      <PostComments
        accountName={accountName}
        permlink={permlink}
        data={data}
      />
    </div>
  );
};

export default PostPageContent;
