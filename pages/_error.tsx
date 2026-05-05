import type { NextPage, NextPageContext } from "next";
import Link from "next/link";

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  const title =
    statusCode === 404
      ? "Page not found"
      : statusCode
        ? `Server error (${statusCode})`
        : "An unexpected error occurred";

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Sorry for the inconvenience. Please try again or return to the home
        page.
      </p>
      <div className="flex gap-x-4">
        <button
          type="button"
          onClick={() => location.reload()}
          className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Reload page
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default Error;
