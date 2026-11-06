import { pageMetadata } from "@/common/constants/metadata";
import Terminal from "@/modules/terminal/components/Terminal";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "terminal");
}

export default function TerminalPage({ params: { locale } }: { params: { locale: string } }) {
  return <><h1 className="sr-only">{locale === "id" ? "Terminal Interaktif Najwa Syarif" : "Najwa Syarif Interactive Terminal"}</h1><Terminal /></>;
}