import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/natbuild-logo-full.png";
import mark from "@/public/images/natbuild-mark.png";

/** The NATBUILD cube mark, taken from the official logo artwork. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return <Image src={mark} alt="" aria-hidden="true" className={`object-contain ${className}`} />;
}

/** Full NATBUILD logo (official artwork, transparent background). */
export function Logo({ className = "h-10 w-auto sm:h-[52px]" }: { className?: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="NATBUILD หน้าหลัก">
      <Image src={logo} alt="NATBUILD — Design • Build • Inspect" priority className={className} sizes="240px" />
    </Link>
  );
}
