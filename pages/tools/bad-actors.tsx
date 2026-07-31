import React from "react";
import ToolsLayout from "@/components/tools/ToolsLayout";
import BadActorsTool from "@/components/tools/BadActorsTool";

const ToolsBadActorsPage: React.FC = () => (
  <ToolsLayout active="bad-actors">
    <BadActorsTool />
  </ToolsLayout>
);

export default ToolsBadActorsPage;
