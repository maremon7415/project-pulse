import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function HomePage() {
  const user = await getCurrentUser();

  /* Redirect authenticated users by role */
  if (user) {
    if (user.role === "admin") {
      redirect("/admin");
    } else if (user.role === "employee") {
      redirect("/employee");
    } else if (user.role === "client") {
      redirect("/client");
    }
  }

  /* Public login page */
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <LoginForm />
    </div>
  );
}
