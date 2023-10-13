import React from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface PageNotFoundProps {
  message?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

const PageNotFound: React.FC<PageNotFoundProps> = ({
  message = null,
  extra = null,
  className = "",
}) => {
  const router = useRouter();

  return (
    <>
      <div className={cn("flex mt-8 md:mt-14", className)}>
        <div className="text-6xl md:text-8xl font-bold border-r border-black pb-3 px-4 leading-[80px]">
          404
        </div>
        <div className="flex flex-col justify-center text-4xl font-semibold px-4">
          <p>Error</p>
          <p>Not Found</p>
        </div>
      </div>
      <div className="mt-10">{message}</div>
      <div className="flex mt-10 gap-x-8">
        <Button
          variant={"outline"}
          className="hover:bg-explorer-bg-start"
          onClick={() => location.reload()}
        >
          Reload Page
        </Button>
        <Button
          variant={"outline"}
          className="bg-explorer-yellow hover:bg-explorer-bg-start"
          onClick={() => router.push("/")}
        >
          Go To Home Page
        </Button>
      </div>
      {extra && (
        <div className="w-full flex flex-col items-center mt-10">
          <div className="flex gap-x-4 mb-10">
            <div className="border-b border-gray-300 w-24 md:w-40 h-3.5"></div>
            <div>or</div>
            <div className="border-b border-gray-300 w-24 md:w-40 h-3.5"></div>
          </div>
          {extra}
        </div>
      )}
    </>
  );
};

export default PageNotFound;
