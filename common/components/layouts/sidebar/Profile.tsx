import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { useMenu } from "@/common/stores/menu";

import MobileMenu from "./MobileMenu";
import MobileMenuButton from "./MobileMenuButton";
import ProfileHeader from "./ProfileHeader";
import ThemeToggle from "./ThemeToggle";
import IntlToggle from "./IntlToggle";
import { SearchTrigger } from "@/common/components/elements/CommandSearch";

const Profile = () => {
  const [width, setWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { isOpen, toggleMenu } = useMenu();

  const imageSize = isMobile ? 40 : 100;

  useEffect(() => {
    setWidth(window.innerWidth);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div
      data-responsive-header
      className={clsx(
        "fixed z-20 w-full bg-neutral-50 p-5 shadow-sm dark:border-b dark:border-neutral-800 dark:bg-neutral-900 lg:relative lg:border-none lg:!bg-transparent lg:p-0 xl:shadow-none",
        isOpen && "pb-0",
      )}
    >
      <div className="flex items-center justify-between md:px-2 lg:flex-col lg:space-y-4">
        <ProfileHeader expandMenu={isOpen} imageSize={imageSize} />
        <div className="hidden w-full lg:block">
          <SearchTrigger />
        </div>
        <div className="hidden md:block lg:hidden">
          <SearchTrigger compact />
        </div>
        {isMobile && (
          <div
            className={clsx(
              "mt-1 flex items-center gap-5 lg:hidden",
              isOpen &&
                "h-[130px] flex-col-reverse !items-end justify-between pb-1",
            )}
          >
            <div className="flex gap-4">
              <SearchTrigger compact />
              <IntlToggle />
              <ThemeToggle />
            </div>
            <MobileMenuButton expandMenu={isOpen} setExpandMenu={toggleMenu} />
          </div>
        )}
      </div>

      {isMobile && (
        <AnimatePresence>{isOpen && <MobileMenu />}</AnimatePresence>
      )}
    </div>
  );
};

export default Profile;
