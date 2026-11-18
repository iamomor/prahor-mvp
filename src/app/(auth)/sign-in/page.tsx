import { EmailSignIn } from "@/features/auth/EmailSignIn";
export default async function SignIn({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const next = typeof query.next === "string" ? query.next : "/app";
  const notice = typeof query.error === "string" ? query.error : typeof query.status === "string" ? query.status : "";
  return <EmailSignIn next={next} notice={notice} />;
}
