import { config } from "@/Config";

export default function Footer() {
  const current_year = new Date().getFullYear();
  return (
    <div className="mt-auto	flex flex-col justify-center items-center">
      <p>HIVE Blocks &copy; {current_year} </p>
      <p><span>Commit hash: </span>{config.gitHash}</p>
    </div>
  );
}