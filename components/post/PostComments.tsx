import React, { Fragment, useState } from "react";

import Hive from "@/types/Hive";
import PostContent from "./PostContent";

interface NestedCommentProps {
  discussion: Hive.HivePosts | null | undefined;
  comment: Hive.HivePost | null | undefined;
  isCommentsVisible?: boolean;
  handleCommentsToggle?: () => void;
  commentsLength?: number;
}

interface PostComments {
  accountName: string;
  data: Hive.HivePosts | null | undefined;
  permlink: string;
  isCommentsVisible: boolean;
  handleCommentsToggle: () => void;
}

const NestedComment: React.FC<NestedCommentProps> = ({
  discussion,
  comment,
}) => {
  const [isNestedCommentsVisible, setIsNestedCommentsVisible] = useState(true);

  if (!discussion || !comment) return;

  const shouldFetch = comment.children > 0;
  const nestedReplies = comment.replies;

  const handleNestedCommentsToggle = () => {
    setIsNestedCommentsVisible(!isNestedCommentsVisible);
  };

  return (
    <div className="flex mt-4 justify-end">
      <div className="w-[90%] border-l-[0.5px] border-white pl-4">
        <PostContent
          isComment={true}
          active_votes={comment.active_votes}
          data={comment}
          isCommentsVisible={isNestedCommentsVisible}
          handleCommentsToggle={handleNestedCommentsToggle}
        />

        {isNestedCommentsVisible &&
        shouldFetch &&
        nestedReplies &&
        nestedReplies.length > 0
          ? nestedReplies.map((reply) => {
              return (
                <Fragment key={discussion[reply].post_id}>
                  <NestedComment
                    discussion={discussion}
                    comment={discussion[reply]}
                    isCommentsVisible={isNestedCommentsVisible}
                    handleCommentsToggle={handleNestedCommentsToggle}
                    commentsLength={comment.children}
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
              commentsLength={data[reply].children}
            />
          </Fragment>
        );
      })}
    </>
  );
};

export default PostComments;