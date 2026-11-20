import { PhoneSignIn } from "@/features/auth/PhoneSignIn";
export default async function PhoneSignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return <PhoneSignIn next={typeof query.next === "string" ? query.next : "/app"} />;
}
