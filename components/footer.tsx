export default function Footer() {
  const current_year = new Date().getFullYear();
  return (
    <div className="mt-auto	">
      <p>HIVE Blocks &copy; {current_year} </p>
    </div>
  );
}