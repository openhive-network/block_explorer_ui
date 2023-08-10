import Link from "next/link";

type AccountDetailsCardProps = {
  userDetails: any;
};

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  userDetails,
}) => {
  const keys = userDetails && Object.keys(userDetails);

  const render_key = (key: string) => {
    if (["recovery_account", "reset_account"].includes(key)) {
      return (
        <div className="text-blue-400">
          <Link href={`/account/${userDetails[key]}`}>{userDetails[key]}</Link>{" "}
        </div>
      );
    }
    if (["url"].includes(key)) {
      return (
        <div className="text-blue-400">
          <Link href={userDetails[key]} target="_blank" rel="noreferrer">
            {userDetails[key]}
          </Link>
        </div>
      );
    } else return userDetails[key];
  };

  return (
    <div>
      <div className="text-center mt-8">Properties</div>
      <div className="flex-column">
        {keys?.map((key: string, index: number) => {
          return (
            <div
              key={index}
              className="flex justify-between m-1 whitespace-pre-line"
            >
              <div className="border-b border-solid border-gray-700 flex justify-between py-1 mr-4">
                {key}
              </div>
              <span className=" overflow-auto">
                {typeof userDetails?.[key] != "string" ? (
                  <pre>{JSON.stringify(userDetails?.[key], null, 2)}</pre>
                ) : (
                  render_key(key)
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AccountDetailsCard;
