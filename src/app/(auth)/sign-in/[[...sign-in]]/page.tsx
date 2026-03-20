import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 px-4">
      <div className="flex items-center justify-center">
        <SignIn path="/sign-in" />
      </div>
      <div className="hidden h-full lg:flex bg-blue-600 justify-center items-center">
        <h1 className="text-6xl text-primary-foreground font-bold">
          Finance Manager
        </h1>
      </div>
    </div>
  );
};

export default SignInPage;
