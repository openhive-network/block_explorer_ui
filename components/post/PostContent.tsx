import { useState } from "react";

import Hive from "@/types/Hive";
import PostContentCard from "./PostContentCard";
import PostPropertiesTable from "./PostPropertiesTable";
import VoteDetailsTable from "./VoteDetailsTable";

interface PostContentProps {
  isComment?: boolean;
  active_votes: Hive.ActiveVote[];
  data: Hive.HivePost | null | undefined;
  isCommentsVisible: boolean;
  handleCommentsToggle: () => void;
}

const PostContent: React.FC<PostContentProps> = ({
  isComment = false,
  active_votes,
  data,
  isCommentsVisible,
  handleCommentsToggle,
}) => {
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isVoteDetailsOpen, setIsVoteDetailsOpen] = useState(false);

  const handlePropertiesToggle = () => setIsPropertiesOpen(!isPropertiesOpen);
  const handleVoteDetailsToggle = () =>
    setIsVoteDetailsOpen(!isVoteDetailsOpen);

  const voters = active_votes.map((vote) => vote.voter) ?? [];

return (
  <div className="flex flex-col">
    <PostContentCard
      isComment={isComment}
      isPropertiesOpen={isPropertiesOpen}
      isVoteDetailsOpen={isVoteDetailsOpen}
      isCommentsVisible={isCommentsVisible}
      handlePropertiesToggle={handlePropertiesToggle}
      handleVoteDetailsToggle={handleVoteDetailsToggle}
      handleCommentsToggle={handleCommentsToggle}
      voteDetailsLength={active_votes.length ?? 0}
      voters={voters}
      data={data}
      commentsLength={data?.children ?? 0}
    />

    {(isPropertiesOpen || isVoteDetailsOpen) && (
      <div className="mt-1 flex flex-col gap-2 md:flex-row">
        {isPropertiesOpen && (
          <div className="flex-1 min-w-0">
            <PostPropertiesTable
              isPropertiesOpen={isPropertiesOpen}
              data={data}
            />
          </div>
        )}
        {isVoteDetailsOpen && active_votes.length > 0 && (
          <div className="flex-1 min-w-0">
            <VoteDetailsTable
              isVoteDetailsOpen={isVoteDetailsOpen}
              voteDetails={active_votes}
            />
          </div>
        )}
      </div>
    )}
  </div>
  
);
};

export default PostContent;
