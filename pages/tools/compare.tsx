import React from "react";
import ToolsLayout from "@/components/tools/ToolsLayout";
import CompareTool from "@/components/compare/CompareTool";

const ToolsComparePage: React.FC = () => (
  <ToolsLayout active="compare">
    <CompareTool />
  </ToolsLayout>
);

export default ToolsComparePage;
