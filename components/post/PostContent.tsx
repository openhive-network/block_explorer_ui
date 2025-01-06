import { useState } from "react";

import Hive from "@/types/Hive";
import PostContentCard from "./PostContentCard";
import PostPropertiesTable from "./PostPropertiesTable";
import VoteDetailsTable from "./VoteDetailsTable";

interface PostContentProps {
  isComment?: boolean;
  active_votes: Hive.PostPageVoteDetails[];
  data: Hive.Content;
}

const PostContent: React.FC<PostContentProps> = ({
  isComment = false,
  active_votes,
  data,
}) => {
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isVoteDetailsOpen, setIsVoteDetailsOpen] = useState(false);

  const handlePropertiesToggle = () => setIsPropertiesOpen(!isPropertiesOpen);
  const handleVoteDetailsToggle = () =>
    setIsVoteDetailsOpen(!isVoteDetailsOpen);

  const voters = active_votes.map((vote) => vote.voter) ?? [];

  return (
    <>
      <PostContentCard
        isComment={isComment}
        isPropertiesOpen={isPropertiesOpen}
        isVoteDetailsOpen={isVoteDetailsOpen}
        handlePropertiesToggle={handlePropertiesToggle}
        handleVoteDetailsToggle={handleVoteDetailsToggle}
        voteDetailsLength={active_votes.length ?? 0}
        voters={voters}
        data={data}
      />
      <PostPropertiesTable
        isPropertiesOpen={isPropertiesOpen}
        data={data}
      />
      {active_votes.length ? (
        <VoteDetailsTable
          isVoteDetailsOpen={isVoteDetailsOpen}
          voteDetails={active_votes}
        />
      ) : null}
    </>
  );
};

export default PostContent;
