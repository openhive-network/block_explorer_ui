import { useRouter } from "next/router";
import React from "react";
import { Button } from "../components/ui/button";

const ErrorPage: React.FC = () => {
  const router = useRouter();
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="">
        An error occured
      </div>
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
          onClick={() => {router.push("/").then(() => location.reload())}}
        >
          Go To Home Page
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
