import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

const SignInPage = () => {
  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 px-4">
      <div className="flex items-center justify-center">
        <SignIn path="/sign-in" />
      </div>
      <div className="hidden h-full lg:flex bg-blue-600 justify-center">
        <Image src="/logo.svg" alt="logo" width="200" height="200" />
      </div>
    </div>
  );
};

export default SignInPage;
