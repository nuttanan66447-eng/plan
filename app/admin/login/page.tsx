import { LogoMark } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <section className="blueprint grid min-h-[70vh] place-items-center py-16">
      <div className="card w-full max-w-sm p-8">
        <LogoMark className="h-10 w-10" />
        <p className="label-tech mt-5 text-bronze-dark">NATBUILD Back Office</p>
        <h1 className="mt-1 text-[22px] font-bold">เข้าสู่ระบบเจ้าหน้าที่</h1>
        <LoginForm />
      </div>
    </section>
  );
}
