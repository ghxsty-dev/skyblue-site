import Link from "next/link";
import { redirect } from "next/navigation";
import PremiumCodesPanel from "@/components/admin/PremiumCodesPanel";
import { isAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminPremiumCodesPage() {
  if (!(await isAdmin())) redirect("/login");
  return <div className="admin-codes-page"><header><div><Link href="/admin/dashboard">← Dashboard</Link><h1>Premium Kodları</h1><p>Tool bazlı ve süreli erişim kodları oluştur.</p></div></header><PremiumCodesPanel /></div>;
}
