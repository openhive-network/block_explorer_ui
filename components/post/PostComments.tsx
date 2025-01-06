import React from "react";
import { useRouter } from "next/router";

import Hive from "@/types/Hive";
import PostContent from "./PostContent";
import usePostContentReplies from "@/hooks/api/postPage/usePostContentReplies";

interface NestedCommentProps {
  comment: Hive.Content;
}

const NestedComment: React.FC<NestedCommentProps> = ({ comment }) => {
  const shouldFetch = comment.children > 0;

  const { data: nestedReplies } = usePostContentReplies(
    comment.author,
    comment.permlink,

    {
      enabled: shouldFetch,
    }
  );

  return (
    <div
      className="flex mt-4 justify-end"
      key={comment.id}
    >
      <div className="w-[90%]">
        <PostContent
          isComment={true}
          active_votes={comment.active_votes}
          data={comment}
        />

        {shouldFetch && nestedReplies && nestedReplies.length > 0
          ? nestedReplies.map((child) => (
              <NestedComment
                key={child.id}
                comment={child}
              />
            ))
          : null}
      </div>
    </div>
  );
};

const PostComments = () => {
  const router = useRouter();
  const { post } = router?.query;
  let accountName = post?.[1] ?? "";
  let permlink = post?.[2] ?? "";

  const { data: comments } = usePostContentReplies(accountName, permlink);

  if (!comments || !comments.length) {
    return null;
  }

  return (
    <>
      {comments.map((comment) => (
        <NestedComment
          key={comment.id}
          comment={comment}
        />
      ))}
    </>
  );
};

export default PostComments;
