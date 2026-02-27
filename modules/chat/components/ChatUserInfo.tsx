import React from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { HiOutlineLogout as SignOutIcon, HiOutlineViewGrid as DashboardIcon } from "react-icons/hi";
import Link from "next/link";
import cn from "@/common/libs/clsxm";

const ChatUserInfo = ({ isWidget = false }: { isWidget?: boolean }) => {
  const t = useTranslations("ChatRoomPage.sign_in");

  const { data: session } = useSession();

  const userName = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;
  

  const adminEmail = process.env.NEXT_PUBLIC_AUTHOR_EMAIL;

  return session ? (
    <div
      className={cn(
        "flex flex-col items-center justify-between pb-3 gap-4 px-4 text-sm md:flex-row",
        isWidget && "text-xs",
      )}
    >
      <div className="flex flex-wrap gap-1 text-neutral-500">
        <p>{t("signed_label")}</p>
        <p className="font-medium">{userName}</p>
        <p>({userEmail})</p>
      </div>
      
      {!isWidget && (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          
          
          {userEmail === adminEmail && (
            <Link
              href="/admin"
              className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-600 px-3 py-1 font-medium text-blue-50 transition duration-100 hover:bg-blue-500 active:scale-90"
            >
              <DashboardIcon size={16} />
              <span>Dashboard Admin</span>
            </Link>
          )}

          
          <button
            onClick={() => signOut()}
            className="flex cursor-pointer items-center gap-1 rounded-md bg-red-600 px-3 py-1 font-medium text-red-50 transition duration-100 hover:bg-red-500 active:scale-90"
          >
            <SignOutIcon size={16} />
            <span>{t("sign_out_label")}</span>
          </button>
          
        </div>
      )}
    </div>
  ) : null;
};

export default ChatUserInfo;