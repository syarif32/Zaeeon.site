"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { BsArrowRightShort as ExternalLinkIcon } from "react-icons/bs";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { MenuItemProps } from "@/common/types/menu";
import { useMenu } from "@/common/stores/menu";
import SpotlightCard from "../../elements/SpotlightCard";

const MenuItem = ({
  title,
  href,
  icon,
  onClick,
  className = "",
  isHover,
  children,
  isExclusive,
}: MenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { hideMenu } = useMenu();
  const isExternalUrl = href?.includes("http");
  const isHashLink = href === "#";

  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const t = useTranslations("Navigation");

  const activeClasses = `${
    isExclusive
      ? "my-1 flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-primary hover:bg-primary/20 dark:border-primary-300 dark:bg-primary-300/10 dark:text-primary-300 dark:hover:bg-primary-400/20 lg:transition-all lg:duration-300 lg:hover:scale-105"
      : `
        flex items-center gap-2 py-2 px-4 
        text-neutral-700 dark:text-neutral-400 
        hover:text-neutral-900 hover:dark:text-neutral-300 
        rounded-lg group 
      ${
        isActive
          ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:!text-neutral-200"
          : "hover:dark:lg:bg-neutral-800 hover:dark:!text-neutral-300 hover:lg:bg-neutral-200 hover:lg:rounded-lg lg:hover:scale-105 lg:transition-all lg:duration-300"
      }`
  }`;

  const handleClick = () => {
    hideMenu();
    if (onClick) onClick();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const elementProps = {
    className: `${activeClasses} ${className}`,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  const itemComponent = () => {
    return (
      <div {...elementProps}>
        {!isExclusive ? (
          <>
            <div
              className={clsx(
                "transition-all duration-300 group-hover:-rotate-12",
                isActive && "animate-pulse",
              )}
            >
              {icon}
            </div>
            <div className="flex-grow">{t(title)}</div>
            {children && <>{children}</>}
            {isActive && (
              <ExternalLinkIcon
                size={22}
                className="animate-pulse text-gray-500"
              />
            )}
            {isExternalUrl && isHovered && (
              <ExternalLinkIcon
                size={22}
                className="-rotate-45 text-gray-500 lg:transition-all lg:duration-300"
              />
            )}
          </>
        ) : (
          <>
            <div
              className={clsx(
                "transition-all duration-300 group-hover:-rotate-12",
                isActive && "animate-pulse",
              )}
            >
              {icon}
            </div>
            <div className="flex-grow">{t(title)}</div>
          </>
        )}
      </div>
    );
  };

  return isHashLink ? (
    <div className="cursor-pointer">{itemComponent()}</div>
  ) : (
    <Link
      aria-current={isActive ? "page" : undefined}
      href={href}
      target={isExternalUrl ? "_blank" : ""}
      onClick={handleClick}
    >
      {itemComponent()}
    </Link>
  );
};

export default MenuItem;
