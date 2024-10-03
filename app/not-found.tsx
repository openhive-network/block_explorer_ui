import Link from "next/link";
import "@/styles/theme.css";

export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="flex">
        <div className="text-6xl md:text-8xl font-bold border-r border-black pb-3 px-4 leading-[80px]">
          404
        </div>
        <div className="flex flex-col justify-center text-4xl font-semibold px-4">
          <p>Error</p>
          <p>Not Found</p>
        </div>
      </div>
      <div className="flex mt-10 gap-x-8">
        <Link href="/">Go To Home Page</Link>
      </div>
    </div>
  );
}
