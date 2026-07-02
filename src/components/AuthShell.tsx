import Link from "next/link";
import { ReactNode } from "react";
import { site } from "@/lib/site";
import { RestaurantIcon } from "./RestaurantIcon";

const authHeroImage =
  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxRSgvb8bioVqcihcM03MlKM5tUxxJbUVrWbRio6wfG3efItl5K9pXCqiIpC7EG6Dr5bNSFEUpN3ru9D2TE0ciCZZk5PrYeTx4dhxcgMt_9pGeW1YF7opFYh-2KfVny8G24WJH65GOki95KBKWai4pLrpmbMQuIHCFKOSo8mpdxH63AhM4grX1G2NFg8jL8QqT4gUBi4bCtBIHTsSTo7RInW61OoqGWFh3kSXuvRPOtsx3Hy_pW6yFSmUykzbd4nfr_dkbxIBY_0jQ')";

type AuthShellProps = {
  children: ReactNode;
  heroTitle: string;
  heroText: string;
  isFocused: boolean;
  minHeight?: string;
};

export function AuthShell({
  children,
  heroTitle,
  heroText,
  isFocused,
  minHeight = "min-h-[600px]",
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col bg-background text-on-background">
      <header className="z-10 flex w-full items-center justify-center py-12 md:absolute md:left-0 md:top-0">
        <Link href="/" className="flex items-center gap-2">
          <RestaurantIcon className="size-8 text-primary" />
          <span className="font-headline text-2xl font-extrabold text-primary">
            {site.name}
          </span>
        </Link>
      </header>

      <section className="flex flex-grow items-center justify-center px-4 py-16 md:px-20">
        <div
          className={`grid w-full max-w-6xl overflow-hidden rounded-xl bg-surface-container-lowest shadow-login transition-all duration-300 md:grid-cols-2 ${
            isFocused ? "ring-1 ring-primary" : ""
          }`}
        >
          <div className={`relative hidden overflow-hidden md:block ${minHeight}`}>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: authHeroImage }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 text-on-primary">
              <h1 className="font-headline text-5xl font-extrabold leading-tight">
                {heroTitle}
              </h1>
              <p className="mt-3 text-lg leading-7 opacity-90">{heroText}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-10 md:p-16">
            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
