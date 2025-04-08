interface DataCountMessageProps {
  count: number;
  dataType: string;
}

const DataCountMessage: React.FC<DataCountMessageProps> = ({
  count,
  dataType,
}) => {
  if (!count) return null;

  const message = `A total of ${count} ${dataType} found`;
  return <div className="text-gray-500">{message}</div>;
};

export default DataCountMessage;
