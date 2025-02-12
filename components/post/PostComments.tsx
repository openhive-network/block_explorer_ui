import React, { Fragment } from "react";

import Hive from "@/types/Hive";
import PostContent from "./PostContent";

interface NestedCommentProps {
  discussion: Hive.HivePosts | null | undefined;
  comment: Hive.HivePost | null | undefined;
}

interface PostComments {
  accountName: string;
  data: Hive.HivePosts | null | undefined;
  permlink: string;
}

const NestedComment: React.FC<NestedCommentProps> = ({
  discussion,
  comment,
}) => {
  if (!discussion || !comment) return;

  const shouldFetch = comment.children > 0;
  const nestedReplies = comment.replies;

  return (
    <div className="flex mt-4 justify-end">
      <div className="w-[90%]">
        <PostContent
          isComment={true}
          active_votes={comment.active_votes}
          data={comment}
        />

        {shouldFetch && nestedReplies && nestedReplies.length > 0
          ? nestedReplies.map((reply) => {
              return (
                <Fragment key={discussion[reply].post_id}>
                  <NestedComment
                    discussion={discussion}
                    comment={discussion[reply]}
                  />
                </Fragment>
              );
            })
          : null}
      </div>
    </div>
  );
};

const PostComments: React.FC<PostComments> = ({
  accountName,
  data,
  permlink,
}) => {
  if (!data || !accountName || !permlink) return;

  const originalPostKey = `${accountName}/${permlink}`;
  const originalPost = data[originalPostKey];

  const replies = originalPost?.replies;

  if (!replies || !replies.length) return;

  return (
    <>
      {replies.map((reply) => {
        return (
          <Fragment key={data[reply].post_id}>
            <NestedComment
              discussion={data}
              key={data[reply].post_id}
              comment={data[reply]}
            />
          </Fragment>
        );
      })}
    </>
  );
};

export default PostComments;
