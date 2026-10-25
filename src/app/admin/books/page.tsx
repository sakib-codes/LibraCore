import { redirect } from "next/navigation";

export default function AdminBooksRedirect() {
  redirect("/admin?tab=books");
}
