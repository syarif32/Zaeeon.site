import { pageMetadata } from "@/common/constants/metadata";
export function generateMetadata({ params: { locale } }: { params: { locale: string } }) { return pageMetadata(locale, "layanan"); }
export default function ServicesLayout({ children }: { children: React.ReactNode }) { return children; }
