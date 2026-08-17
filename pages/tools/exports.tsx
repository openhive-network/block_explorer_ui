import React from "react";
import ToolsLayout from "@/components/tools/ToolsLayout";
import ExportsComingSoon from "@/components/tools/ExportsComingSoon";

const ToolsExportsPage: React.FC = () => (
  <ToolsLayout active="exports">
    <ExportsComingSoon />
  </ToolsLayout>
);

export default ToolsExportsPage;
