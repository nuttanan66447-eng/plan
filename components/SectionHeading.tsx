export function SectionHeading({ eyebrow, title, desc, align = "left", dark = false, aside }: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  aside?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${align === "center" ? "items-center text-center md:flex-col md:items-center" : ""}`}>
      <div className={align === "center" ? "max-w-3xl" : "max-w-3xl"}>
        <p className={`eyebrow ${dark ? "!text-bronze-light" : ""}`}>{eyebrow}</p>
        <h2 className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[36px] ${dark ? "text-white" : ""}`}>{title}</h2>
        {desc && <p className={`mt-3 text-[15px] ${dark ? "text-white/65" : "text-muted"}`}>{desc}</p>}
      </div>
      {aside}
    </div>
  );
}
