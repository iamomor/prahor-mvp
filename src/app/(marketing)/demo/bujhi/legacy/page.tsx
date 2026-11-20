import { MedicalEntry } from "@/features/bujhi/MedicalEntry";

export const metadata = { title: "Bujhi | Manual and image entry demo" };

export default function LegacyBujhiDemo() {
  return <MedicalEntry recordsHref="/demo/jibonrekha/records" />;
}
