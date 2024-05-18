import Image from "next/image";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="hidden items-center lg:flex">
        <Image
          src="/logo.svg"
          alt="logo"
          width={50}
          height={50}
          className="object-contain w-36"
        />
      </div>
    </Link>
  );
};

export default HeaderLogo;
