import Link from "next/link";

import { userWithToken } from "@/app/(auth)/auth";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getSignInUrl, signOut } from "@workos-inc/authkit-nextjs";
import { BookOpen, Code, UserRound } from "lucide-react";

export const Navbar = async () => {
  let { user } = await userWithToken();

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30 border-b">
        <div className="flex flex-row gap-3 items-center">
          <div className="flex flex-row gap-2 items-center">
            <img src="/images/paragon-no-text.svg" />
            <Link className="text-sm dark:text-zinc-300 flex items-center font-bold"
              href={process.env.NEXT_PUBLIC_APP_URL!}>
              Managed Sync Playground{" "}
              <span className="uppercase rounded-sm bg-slate-800 dark:bg-slate-700 text-white text-xs p-1 py-[2px] ml-2 font-bold">
                Beta
              </span>
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <a
            className="mr-2 text-sm font-semibold flex items-center rounded hover:bg-secondary py-1.5 px-2 transition-colors"
            target="_blank"
            href="https://github.com/useparagon"
          >
            <Code className="h-4" />
            Source Code
          </a>
          <a
            className="mr-2 text-sm font-semibold flex items-center rounded hover:bg-secondary py-1.5 px-2 transition-colors"
            target="_blank"
            href="https://paragon-managed-sync.mintlify.app/sync/overview"
          >
            <BookOpen className="h-4" />
            Docs
          </a>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="py-1.5 px-2 pr-3 h-fit font-semibold hover:bg-secondary"
                  variant="outline"
                >
                  <UserRound className="h-4 m-0" />
                  {user.firstName
                    ? `${user.firstName} ${user.lastName}`
                    : "Logged in"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem className="p-1 z-50">
                  <form
                    className="w-full"
                    action={async () => {
                      "use server";

                      await signOut();
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full text-left px-1 py-0.5 text-red-500"
                    >
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="py-1.5 px-2 h-fit font-semibold" asChild>
              <Link href={await getSignInUrl()}>Login</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
