import { useRouter } from "next/router";
import React from "react";
import { Button } from "../components/ui/button";
import useApiAddresses from "@/utils/ApiAddresses";
import HealthCheckerDialog from "@/components/HealthCheckerDialog";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";
import { AlertTriangleIcon } from "lucide-react";


interface ErrorPageProps {
  errorMessage?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ errorMessage }) => {
  const router = useRouter();
  const apiAdresses = useApiAddresses();
  const { restApiHealthCheckerService, nodeHealthCheckerService } =
    useHealthCheckerContext();

  const displayMessage = errorMessage || "An error occurred.";

  return (
    <div className="page-container rounded  flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Error Icon */}
      <AlertTriangleIcon size={42} color="red" className="mb-2"/>

      {/* Error Message */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold">{displayMessage}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We're sorry, something went wrong. Please try one of the following options:
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <Button
          variant="outline"
          onClick={() => location.reload()}
          className="hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200"
        >
          Reload Page
        </Button>
        <Button
          onClick={() => {
            router.push("/").then(() => location.reload());
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white transition duration-200"
        >
          Go to Home Page
        </Button>
      </div>

      {/* Health Checkers */}
      <div className="flex flex-col items-center w-full px-4 py-6 bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          Check the status of our services:
        </p>
        <div className="flex justify-center gap-x-4">
          {!!apiAdresses.apiAddress && !!restApiHealthCheckerService && (
            <HealthCheckerDialog
              trigerText="Explorer Backend API"
              apiAddress={apiAdresses.apiAddress}
              healthCheckerService={restApiHealthCheckerService}
            />
          )}
          {!!apiAdresses.nodeAddress && !!nodeHealthCheckerService && (
            <HealthCheckerDialog
              trigerText="Hive Node"
              apiAddress={apiAdresses.nodeAddress}
              healthCheckerService={nodeHealthCheckerService}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
