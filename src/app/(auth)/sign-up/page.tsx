import { EmailSignIn } from "@/features/auth/EmailSignIn";
export default async function SignUp({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return <EmailSignIn mode="sign-up" next={typeof query.next === "string" ? query.next : "/app"} />;
}
