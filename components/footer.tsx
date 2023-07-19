export default function Footer() {
  const current_year = new Date().getFullYear();
  return (
    <div>
      <p>HIVE Blocks &copy; {current_year} </p>
    </div>
  );
}