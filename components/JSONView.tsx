import React from "react";

interface JSONViewProps {
  json: object;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({ json, className }) => {
  return (
    <div className={className}>
      <pre>{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
};

export default JSONView;
