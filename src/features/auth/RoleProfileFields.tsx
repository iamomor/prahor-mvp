"use client";
import { Heart, HeartHandshake, Stethoscope, Users, Check } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { emptyRoleDetails, type Onboarding, type RoleDetails } from "@/lib/contracts/account";

export const emptyRoleProfile: Onboarding = {
  displayName: "",
  purposes: [],
  organization: "",
  registrationNumber: "",
  details: emptyRoleDetails,
};

type Copy = { en: string; bn: string };

function ProfileInput({
  id, label, value, onChange, required = false, maxLength = 120,
  autoComplete, type = "text", placeholder, hint,
}: {
  id: string; label: Copy; value: string; onChange: (value: string) => void;
  required?: boolean; maxLength?: number; autoComplete?: string;
  type?: string; placeholder?: string; hint?: Copy;
}) {
  const { t } = useLanguage();
  return (
    <div className="auth-field">
      <div className="auth-field-label-row">
        <label htmlFor={id} className="auth-field-label">
          {t(label)}
          {required
            ? <span className="auth-required-star" aria-hidden="true"> *</span>
            : <span className="auth-optional-tag"> {t({ en: "Optional", bn: "ঐচ্ছিক" })}</span>}
        </label>
      </div>
      <input
        id={id}
        className="auth-input"
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint && <p className="auth-field-hint">{t(hint)}</p>}
    </div>
  );
}

export function RoleProfileFields({
  value, onChange, disabled = false, section = "all",
}: {
  value: Onboarding; onChange: (value: Onboarding) => void;
  disabled?: boolean; section?: "all" | "roles" | "details";
}) {
  const { t } = useLanguage();

  const choices = [
    {
      id: "mother", icon: Heart, badgeClass: "auth-role-badge-mother",
      en: "Mother", bn: "মা",
      description: { en: "Care for myself and my baby", bn: "আমার ও আমার শিশুর যত্ন" },
    },
    {
      id: "supporter", icon: HeartHandshake, badgeClass: "auth-role-badge-supporter",
      en: "Family or supporter", bn: "পরিবার বা সহায়তাকারী",
      description: { en: "Support someone I care about", bn: "প্রিয়জনের যত্নে সহায়তা" },
    },
    {
      id: "doctor", icon: Stethoscope, badgeClass: "auth-role-badge-doctor",
      en: "Doctor", bn: "চিকিৎসক",
      description: { en: "Provide professional care", bn: "পেশাগত সেবা প্রদান" },
    },
    {
      id: "chw", icon: Users, badgeClass: "auth-role-badge-chw",
      en: "Community health worker", bn: "কমিউনিটি স্বাস্থ্যকর্মী",
      description: { en: "Connect my community to care", bn: "কমিউনিটিকে সেবার সাথে যুক্ত করা" },
    },
  ] as const;

  const professional = value.purposes.some(p => p === "doctor" || p === "chw");
  const details = value.details ?? emptyRoleDetails;

  function detail<K extends keyof RoleDetails>(key: K, next: RoleDetails[K]) {
    onChange({ ...value, details: { ...details, [key]: next } });
  }

  return (
    <fieldset className="auth-profile-fields min-w-0" disabled={disabled}>
      <legend className="sr-only">{t({ en: "Your role and profile", bn: "আপনার পরিচয় ও তথ্য" })}</legend>

      {section !== "details" && (
        <fieldset className="min-w-0 auth-role-fieldset" aria-describedby="roles-hint">
          <legend className="auth-field-label">
            {t({ en: "I'm joining PROHOR as…", bn: "আমি প্রহরে যোগ দিচ্ছি…" })}
          </legend>
          <p id="roles-hint" className="auth-field-hint" style={{ marginBottom: "0.75rem" }}>
            {t({
              en: "Choose the one role that fits you best.",
              bn: "আপনার সবচেয়ে উপযোগী একটি পরিচয় বেছে নিন।",
            })}
          </p>

          <div className="auth-role-grid">
            {choices.map(choice => {
              const selected = value.purposes.includes(choice.id);
              const Icon = choice.icon;
              return (
                <label key={choice.id} className="auth-role-option" data-selected={selected}>
                  <div className="auth-role-top">
                    <span className={`auth-role-icon-box ${choice.badgeClass}`}>
                      <Icon size={18} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className="auth-role-check" aria-hidden="true">
                      {selected && <Check size={12} strokeWidth={2.5} />}
                    </span>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={selected}
                      name="purposes"
                      value={choice.id}
                      onChange={() => onChange({ ...value, purposes: [choice.id] })}
                    />
                  </div>
                  <span className="auth-role-name">{t(choice)}</span>
                  <span className="auth-role-desc">{t(choice.description)}</span>
                </label>
              );
            })}
          </div>

          <p className="auth-field-hint" style={{ marginTop: "0.75rem" }}>
            {t({
              en: "Doctor and health-worker roles are reviewed before any patient information is available.",
              bn: "চিকিৎসক ও স্বাস্থ্যকর্মীর পরিচয় যাচাইয়ের পরই রোগীর তথ্য দেখা যাবে।",
            })}
          </p>
        </fieldset>
      )}

      {section !== "roles" && (
        <div>
          <ProfileInput
            id="display-name"
            label={{ en: "Full name", bn: "পুরো নাম" }}
            required
            autoComplete="name"
            placeholder={t({ en: "e.g. Ayesha Rahman", bn: "যেমন: আয়েশা রহমান" })}
            value={value.displayName}
            onChange={displayName => onChange({ ...value, displayName })}
          />

          <div className="auth-field-row">
            <ProfileInput
              id="profile-phone"
              label={{ en: "Phone number", bn: "ফোন নম্বর" }}
              type="tel"
              autoComplete="tel"
              maxLength={32}
              placeholder="+880 17XX-XXXXXX"
              value={details.phone}
              onChange={phone => detail("phone", phone)}
            />
            <ProfileInput
              id="profile-district"
              label={{ en: "District or city", bn: "জেলা বা শহর" }}
              autoComplete="address-level2"
              maxLength={100}
              placeholder={t({ en: "e.g. Dhaka, Sylhet", bn: "যেমন: ঢাকা, সিলেট" })}
              value={details.district}
              onChange={district => detail("district", district)}
            />
          </div>

          {value.purposes.includes("mother") && (
            <section aria-labelledby="mother-stage-heading" style={{ marginTop: "1rem" }}>
              <h3 id="mother-stage-heading" className="auth-subsection-head">
                {t({ en: "Your care journey", bn: "আপনার যত্নের যাত্রা" })}
              </h3>
              <div className="auth-field">
                <label htmlFor="care-stage" className="auth-field-label">
                  {t({ en: "Your current stage", bn: "আপনার বর্তমান পর্যায়" })}
                  <span className="auth-optional-tag"> {t({ en: "Optional", bn: "ঐচ্ছিক" })}</span>
                </label>
                <select
                  id="care-stage"
                  className="auth-input auth-select"
                  value={details.careStage}
                  onChange={e => detail("careStage", e.target.value as RoleDetails["careStage"])}
                >
                  <option value="">{t({ en: "Select a stage", bn: "পর্যায় বেছে নিন" })}</option>
                  <option value="planning">{t({ en: "Planning for pregnancy", bn: "গর্ভধারণের পরিকল্পনা করছি" })}</option>
                  <option value="pregnant">{t({ en: "Currently pregnant", bn: "বর্তমানে গর্ভবতী" })}</option>
                  <option value="postpartum">{t({ en: "Postpartum / caring for my baby", bn: "প্রসবের পর / শিশুর যত্ন নিচ্ছি" })}</option>
                  <option value="prefer_not_to_say">{t({ en: "Prefer not to say", bn: "বলতে চাই না" })}</option>
                </select>
                <p className="auth-field-hint">
                  {t({ en: "You can skip this. Your care and access do not depend on it.", bn: "এটি এড়িয়ে যেতে পারেন। আপনার সেবা বা প্রবেশাধিকার এর ওপর নির্ভর করে না।" })}
                </p>
              </div>
            </section>
          )}

          {value.purposes.includes("supporter") && (
            <section aria-labelledby="supporter-role-heading" style={{ marginTop: "1rem" }}>
              <h3 id="supporter-role-heading" className="auth-subsection-head">
                {t({ en: "How you offer support", bn: "আপনি যেভাবে সহায়তা করেন" })}
              </h3>
              <div className="auth-field">
                <label htmlFor="supporter-type" className="auth-field-label">
                  {t({ en: "Your supporting role", bn: "সহায়তায় আপনার পরিচয়" })}
                  <span className="auth-optional-tag"> {t({ en: "Optional", bn: "ঐচ্ছিক" })}</span>
                </label>
                <select
                  id="supporter-type"
                  className="auth-input auth-select"
                  value={details.supporterType}
                  onChange={e => detail("supporterType", e.target.value as RoleDetails["supporterType"])}
                >
                  <option value="">{t({ en: "Select an option", bn: "একটি বেছে নিন" })}</option>
                  <option value="family">{t({ en: "Family member or partner", bn: "পরিবারের সদস্য বা সঙ্গী" })}</option>
                  <option value="caregiver">{t({ en: "Caregiver", bn: "যত্নকারী" })}</option>
                  <option value="supporter">{t({ en: "Friend or trusted supporter", bn: "বন্ধু বা বিশ্বস্ত সহায়তাকারী" })}</option>
                </select>
                <p className="auth-field-hint">
                  {t({ en: "The mother chooses what to share and invites you after registration.", bn: "নিবন্ধনের পর মা কী শেয়ার করবেন তা বেছে আপনাকে আমন্ত্রণ জানাবেন।" })}
                </p>
              </div>
            </section>
          )}

          {professional && (
            <section aria-labelledby="professional-heading" style={{ marginTop: "1rem" }}>
              <h3 id="professional-heading" className="auth-subsection-head">
                {t({ en: "Professional profile", bn: "পেশাগত পরিচয়" })}
              </h3>
              <ProfileInput
                id="organization"
                label={{ en: "Organization or practice", bn: "প্রতিষ্ঠান বা কর্মস্থল" }}
                required
                maxLength={160}
                autoComplete="organization"
                placeholder={t({ en: "e.g. Dhaka Medical College Hospital", bn: "যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল" })}
                value={value.organization}
                onChange={organization => onChange({ ...value, organization })}
              />
              <div className="auth-field-row">
                <ProfileInput
                  id="registration"
                  label={{ en: "Registration number", bn: "নিবন্ধন নম্বর" }}
                  required={value.purposes.includes("doctor")}
                  maxLength={100}
                  placeholder={t({ en: "BMDC / Nursing Reg. No.", bn: "বিএমডিসি / নার্সিং নিবন্ধন নম্বর" })}
                  value={value.registrationNumber}
                  onChange={registrationNumber => onChange({ ...value, registrationNumber })}
                />
                <ProfileInput
                  id="qualification"
                  label={{ en: "Qualification", bn: "যোগ্যতা" }}
                  placeholder={t({ en: "e.g. MBBS, FCPS", bn: "যেমন: এমবিবিএস, এফসিপিএস" })}
                  value={details.qualification}
                  onChange={qualification => detail("qualification", qualification)}
                />
              </div>
              {value.purposes.includes("doctor") && (
                <ProfileInput
                  id="specialty"
                  label={{ en: "Specialty / area of practice", bn: "বিশেষত্ব / কাজের ক্ষেত্র" }}
                  placeholder={t({ en: "e.g. Obstetrics & Gynecology", bn: "যেমন: প্রসূতি ও স্ত্রীরোগ বিশেষজ্ঞ" })}
                  value={details.specialty}
                  onChange={specialty => detail("specialty", specialty)}
                />
              )}
              {value.purposes.includes("chw") && (
                <ProfileInput
                  id="service-area"
                  label={{ en: "Community / service area", bn: "কমিউনিটি / সেবার এলাকা" }}
                  placeholder={t({ en: "e.g. Union / Ward name", bn: "যেমন: ইউনিয়ন বা ওয়ার্ডের নাম" })}
                  value={details.serviceArea}
                  onChange={serviceArea => detail("serviceArea", serviceArea)}
                />
              )}
              <p className="auth-field-hint">
                {t({
                  en: "Professional details are self-declared. Provider access requires verified authorization.",
                  bn: "পেশাগত তথ্য আপনার দেওয়া। সেবাদাতার পূর্ণ প্রবেশাধিকারের জন্য প্রাতিষ্ঠানিক অনুমোদন প্রয়োজন।",
                })}
              </p>
            </section>
          )}
        </div>
      )}
    </fieldset>
  );
}
