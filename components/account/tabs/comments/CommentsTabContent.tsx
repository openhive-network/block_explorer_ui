import CommentPermlinkSearchResults from "@/components/home/searches/searchesResults/CommentPermlinkSearchResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountCommentsPermlinkSearch from "./AccountCommentsPermlinkSearch";

const CommentsTabContent = () => {
  return (
    <TabsContent value="comments">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Comment Search</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountCommentsPermlinkSearch />
        </CardContent>
      </Card>
      <CommentPermlinkSearchResults />
    </TabsContent>
  );
};

export default CommentsTabContent;
