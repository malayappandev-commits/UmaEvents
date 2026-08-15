import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guards";
import { ProfileForm } from "@/components/admin/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { profile } = await requireStaff();
  return (
    <div>
      <h1 className="font-serif text-4xl">Profile</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
