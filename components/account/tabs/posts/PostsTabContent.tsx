import CommentsPermlinkSearch from "@/components/home/searches/CommentPermlinkSearch";
import CommentPermlinkSearchResults from "@/components/home/searches/searchesResults/CommentPermlinkSearchResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

const PostsTabContent = () => {
  return (
    <TabsContent value="posts">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Post search</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentsPermlinkSearch />
        </CardContent>
      </Card>
      <CommentPermlinkSearchResults />
    </TabsContent>
  );
};

export default PostsTabContent;
