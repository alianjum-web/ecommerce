import AuthLogin from "@/components/auth/AuthLogin";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return <AuthLogin redirect={searchParams.redirect ?? "/"} />;
}