import { useRouter } from "next/router";
import Link from "next/link";

import usePostContent from "@/hooks/api/postPage/usePostContent";
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

  const { data } = usePostContent(accountName, permlink);

  const buildLinkByUrl = (url: string) => {
    return `${url}/${accountName}/${permlink}`;
  };

  const LINKS = [
    { name: "hive.blog", href: buildLinkByUrl(HIVE_BLOG_URL) },
    { name: "peakd.com", href: buildLinkByUrl(PEAKD_URL) },
    { name: "ecency.com", href: buildLinkByUrl(ECENCY_URL) },
  ];

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
        data={data}
      />
      <PostComments />
    </div>
  );
};

export default PostPageContent;
