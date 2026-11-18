"use client";
import { Heart, HeartHandshake, Stethoscope, Users, Check } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { emptyRoleDetails, type Onboarding, type RoleDetails } from "@/lib/contracts/account";

export const emptyRoleProfile: Onboarding = { displayName: "", purposes: [], organization: "", registrationNumber: "", details: emptyRoleDetails };
type Copy = { en: string; bn: string };
function ProfileInput({ id, label, value, onChange, required = false, maxLength = 120, autoComplete, type = "text", placeholder }: {
  id: string; label: Copy; value: string; onChange: (value: string) => void; required?: boolean;
  maxLength?: number; autoComplete?: string; type?: string; placeholder?: string;
}) {
  const { t } = useLanguage();
  return <div className="auth-field"><label htmlFor={id}>{t(label)}{required ? <span aria-hidden="true"> *</span> : <span className="auth-optional">{t({ en: "Optional", bn: "ঐচ্ছিক" })}</span>}</label>
    <input id={id} className="auth-input" type={type} autoComplete={autoComplete} required={required} maxLength={maxLength}
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>;
}
export function RoleProfileFields({ value, onChange, disabled = false, section = "all" }: {
  value: Onboarding; onChange: (value: Onboarding) => void; disabled?: boolean; section?: "all" | "roles" | "details";
}) {
  const { t } = useLanguage();
  const choices = [
    { id: "mother", icon: Heart, en: "Mother", bn: "মা", description: { en: "Care for myself and my baby", bn: "আমার ও আমার শিশুর যত্ন" } },
    { id: "supporter", icon: HeartHandshake, en: "Family or supporter", bn: "পরিবার বা সহায়তাকারী", description: { en: "Support someone I care about", bn: "প্রিয়জনের যত্নে সহায়তা" } },
    { id: "doctor", icon: Stethoscope, en: "Doctor", bn: "চিকিৎসক", description: { en: "Provide professional care", bn: "পেশাগত সেবা প্রদান" } },
    { id: "chw", icon: Users, en: "Community health worker", bn: "কমিউনিটি স্বাস্থ্যকর্মী", description: { en: "Connect my community to care", bn: "কমিউনিটিকে সেবার সাথে যুক্ত করা" } },
  ] as const;
  const professional = value.purposes.some(p => p === "doctor" || p === "chw");
  const details = value.details ?? emptyRoleDetails;
  function detail<K extends keyof RoleDetails>(key: K, next: RoleDetails[K]) {
    onChange({ ...value, details: { ...details, [key]: next } });
  }
  return <fieldset className="auth-profile-fields min-w-0" disabled={disabled}>
    <legend className="sr-only">{t({ en: "Your role and profile", bn: "আপনার পরিচয় ও তথ্য" })}</legend>
    {section !== "details" && <fieldset className="min-w-0" aria-describedby="roles-hint">
      <legend className="auth-field-label">{t({ en: "I’m joining PROHOR as…", bn: "আমি প্রহরে যোগ দিচ্ছি…" })}</legend>
      <p id="roles-hint" className="auth-field-hint">{t({ en: "Choose every role that fits you. One account brings them together.", bn: "আপনার সাথে মেলে এমন সব পরিচয় বেছে নিন। একটি অ্যাকাউন্টেই সব থাকবে।" })}</p>
      <div className="auth-role-grid">{choices.map(choice => {
        const selected = value.purposes.includes(choice.id); const Icon = choice.icon;
        return <label key={choice.id} className="auth-role-option" data-selected={selected}>
          <span className="auth-role-top"><Icon size={24} strokeWidth={1.6} aria-hidden="true" />
            <input type="checkbox" checked={selected} name="purposes" value={choice.id}
              onChange={e => onChange({ ...value, purposes: e.target.checked ? [...value.purposes, choice.id] : value.purposes.filter(p => p !== choice.id) })} /></span>
          <span className="auth-role-name">{t(choice)}</span><span className="auth-role-description">{t(choice.description)}</span>
        </label>;
      })}</div>
      <p className="auth-role-note"><Check size={16} aria-hidden="true" />{t({ en: "More than one role? Switch workspaces after signing in.", bn: "একাধিক পরিচয়? সাইন ইন করার পর কর্মক্ষেত্র বদলান।" })}</p>
    </fieldset>}
    {section !== "roles" && <>
      <ProfileInput id="display-name" label={{ en: "Full name", bn: "পুরো নাম" }} required autoComplete="name"
        value={value.displayName} onChange={displayName => onChange({ ...value, displayName })} />
      <div className="auth-field-row">
        <ProfileInput id="profile-phone" label={{ en: "Phone number", bn: "ফোন নম্বর" }} type="tel" autoComplete="tel" maxLength={32} placeholder="+880"
          value={details.phone} onChange={phone => detail("phone", phone)} />
        <ProfileInput id="profile-district" label={{ en: "District or city", bn: "জেলা বা শহর" }} autoComplete="address-level2" maxLength={100}
          value={details.district} onChange={district => detail("district", district)} />
      </div>
      {value.purposes.includes("mother") && <section className="auth-role-details"><h3>{t({ en: "Your care journey", bn: "আপনার যত্নের যাত্রা" })}</h3>
        <div className="auth-field"><label htmlFor="care-stage">{t({ en: "Your current stage", bn: "আপনার বর্তমান পর্যায়" })}<span className="auth-optional">{t({ en: "Optional", bn: "ঐচ্ছিক" })}</span></label>
          <select id="care-stage" className="auth-input" value={details.careStage} onChange={e => detail("careStage", e.target.value as RoleDetails["careStage"])}>
            <option value="">{t({ en: "Select a stage", bn: "পর্যায় বেছে নিন" })}</option>
            <option value="planning">{t({ en: "Planning for pregnancy", bn: "গর্ভধারণের পরিকল্পনা করছি" })}</option>
            <option value="pregnant">{t({ en: "Currently pregnant", bn: "বর্তমানে গর্ভবতী" })}</option>
            <option value="postpartum">{t({ en: "Postpartum / caring for my baby", bn: "প্রসবের পর / শিশুর যত্ন নিচ্ছি" })}</option>
            <option value="prefer_not_to_say">{t({ en: "Prefer not to say", bn: "বলতে চাই না" })}</option>
          </select></div>
        <p className="auth-field-hint">{t({ en: "You can skip this. Your care and access do not depend on it.", bn: "এটি এড়িয়ে যেতে পারেন। আপনার সেবা বা প্রবেশাধিকার এর ওপর নির্ভর করে না।" })}</p>
      </section>}
      {value.purposes.includes("supporter") && <section className="auth-role-details"><h3>{t({ en: "How you offer support", bn: "আপনি যেভাবে সহায়তা করেন" })}</h3>
        <div className="auth-field"><label htmlFor="supporter-type">{t({ en: "Your supporting role", bn: "সহায়তায় আপনার পরিচয়" })}<span className="auth-optional">{t({ en: "Optional", bn: "ঐচ্ছিক" })}</span></label>
          <select id="supporter-type" className="auth-input" value={details.supporterType} onChange={e => detail("supporterType", e.target.value as RoleDetails["supporterType"])}>
            <option value="">{t({ en: "Select an option", bn: "একটি বেছে নিন" })}</option>
            <option value="family">{t({ en: "Family member or partner", bn: "পরিবারের সদস্য বা সঙ্গী" })}</option>
            <option value="caregiver">{t({ en: "Caregiver", bn: "যত্নকারী" })}</option>
            <option value="supporter">{t({ en: "Friend or trusted supporter", bn: "বন্ধু বা বিশ্বস্ত সহায়তাকারী" })}</option>
          </select></div>
        <p className="auth-field-hint">{t({ en: "The mother chooses what to share and invites you after registration.", bn: "নিবন্ধনের পর মা কী শেয়ার করবেন তা বেছে আপনাকে আমন্ত্রণ জানাবেন।" })}</p>
      </section>}
      {professional && <section className="auth-role-details"><h3>{t({ en: "Professional profile", bn: "পেশাগত পরিচয়" })}</h3>
        <ProfileInput id="organization" label={{ en: "Organization or practice", bn: "প্রতিষ্ঠান বা কর্মস্থল" }} required maxLength={160} autoComplete="organization"
          value={value.organization} onChange={organization => onChange({ ...value, organization })} />
        <div className="auth-field-row">
          <ProfileInput id="registration" label={{ en: "Registration number", bn: "নিবন্ধন নম্বর" }} required={value.purposes.includes("doctor")} maxLength={100}
            value={value.registrationNumber} onChange={registrationNumber => onChange({ ...value, registrationNumber })} />
          <ProfileInput id="qualification" label={{ en: "Qualification", bn: "যোগ্যতা" }} value={details.qualification} onChange={qualification => detail("qualification", qualification)} />
        </div>
        {value.purposes.includes("doctor") && <ProfileInput id="specialty" label={{ en: "Specialty / area of practice", bn: "বিশেষত্ব / কাজের ক্ষেত্র" }}
          value={details.specialty} onChange={specialty => detail("specialty", specialty)} />}
        {value.purposes.includes("chw") && <ProfileInput id="service-area" label={{ en: "Community / service area", bn: "কমিউনিটি / সেবার এলাকা" }}
          value={details.serviceArea} onChange={serviceArea => detail("serviceArea", serviceArea)} />}
        <p className="auth-field-hint">{t({ en: "Professional details are self-declared. Provider access requires approval; hackathon providers are simulated.", bn: "পেশাগত তথ্য আপনার দেওয়া। সেবাদাতার প্রবেশে অনুমোদন দরকার; হ্যাকাথনের সেবাদাতা সিমুলেটেড।" })}</p>
      </section>}
    </>}
  </fieldset>;
}
