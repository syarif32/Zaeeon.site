import Link from "next/link";
import { MdVerified as VerifiedIcon } from "react-icons/md";
import { BiTerminal } from "react-icons/bi"; 

import ThemeToggle from "./ThemeToggle";
import IntlToggle from "./IntlToggle";
import Tooltip from "../../elements/Tooltip";
import Image from "../../elements/Image";

import cn from "@/common/libs/clsxm";

interface ProfileHeaderProps {
  expandMenu: boolean;
  imageSize: number;
}

const ProfileHeader = ({ expandMenu, imageSize }: ProfileHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-grow items-center gap-4 lg:flex-col  lg:gap-0.5",
        expandMenu && "flex-col !items-start",
      )}
    >
      <Image
        src={"/images/najwa.jpg"}
        width={expandMenu ? 80 : imageSize * 1}
        height={expandMenu ? 80 : imageSize * 1}
        alt="Muhammad Najwa Syarif"
        className="border-2 border-neutral-400 dark:border-neutral-600 lg:hover:scale-105"
        rounded="rounded-full"
      />

      <div className="mt-1 flex items-center gap-2 lg:mt-4">
        <Link href="/" passHref>
          <h2 className="flex-grow text-lg font-medium lg:text-xl">
            M Najwa Syarif
          </h2>
        </Link>

        <Tooltip title="Verified">
          <VerifiedIcon size={18} className="text-blue-400" />
        </Tooltip>
      </div>
      <div className="hidden items-center gap-2 text-sm text-neutral-600 transition-all duration-300 dark:text-neutral-500 lg:flex mt-1">
        <span className="hover:text-neutral-700 dark:hover:text-neutral-400">
          @najwa_sarep
        </span>

        <Tooltip title="Access Mainframe?">
          <Link
            href="/terminal"
            className="flex items-center mt-0.5 opacity-1 transition-all duration-300 hover:scale-125 hover:text-green-500 hover:opacity-100"
            aria-label="Terminal Mode"
          >
            <BiTerminal size={20} />
          </Link>
        </Tooltip>
      </div>
     

      <div className="hidden justify-between gap-6 lg:mt-4 lg:flex">
        <IntlToggle />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default ProfileHeader;