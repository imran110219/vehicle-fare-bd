import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export default function RegisterPage() {
  async function register(formData: FormData) {
    "use server";
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    };

    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      redirect("/register?error=invalid");
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existing) {
      redirect("/register?error=exists");
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash
      }
    });

    redirect("/login");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm max-w-md">
      <h1 className="text-2xl font-bold text-brand-900">Create account</h1>
      <form action={register} className="mt-4 space-y-3">
        <input name="name" placeholder="Name" className="w-full rounded-lg border border-brand-200 p-2" />
        <input name="email" type="email" placeholder="Email" className="w-full rounded-lg border border-brand-200 p-2" />
        <input name="password" type="password" placeholder="Password" className="w-full rounded-lg border border-brand-200 p-2" />
        <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 text-white">
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <a className="text-brand-700" href="/login">Sign in</a>
      </p>
    </div>
  );
}
