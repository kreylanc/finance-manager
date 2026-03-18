import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="hidden items-center lg:flex">
        <h1 className="text-2xl font-bold">Boring Finance</h1>
      </div>
    </Link>
  );
};

export default HeaderLogo;
