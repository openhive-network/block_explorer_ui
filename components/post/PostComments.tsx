import Hive from "@/types/Hive";
import PostContent from "./PostContent";

interface PostCommentsProps {
  comments: Hive.Content[];
}

const PostComments: React.FC<PostCommentsProps> = ({ comments }) => {
  if (!comments || !comments.length) return null;

  return comments.map((comment) => {
    return (
      <div
        className="flex mt-4 justify-center"
        key={comment.id}
      >
        <div className="w-[70%]">
          <PostContent
            active_votes={comment.active_votes}
            data={comment}
          />
        </div>
      </div>
    );
  });
};

export default PostComments;
