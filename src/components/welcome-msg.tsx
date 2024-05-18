"use client";

import { useUser } from "@clerk/nextjs";

const WelcomeMsg = () => {
  const { user, isLoaded } = useUser();
  return (
    <div className="space-y-2 mb-4">
      <h2 className="text-xl font-bold lg:text-4xl">
        Welcome back
        {isLoaded ? <span>, {user?.firstName || user?.username}</span> : " "} 👋
      </h2>
      <p>This is your Financial Overview Report</p>
    </div>
  );
};

export default WelcomeMsg;
