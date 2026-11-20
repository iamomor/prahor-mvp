import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("accounts edit their own profile; supporters get the fuller help-area list", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin bypassrls;
      create schema auth;
      grant usage on schema public, auth to anon, authenticated, service_role;
      create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz,
        is_anonymous boolean not null default false, raw_user_meta_data jsonb not null default '{}');
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$;
    `);
    const migrations = new URL("../../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(migrations)).filter(name => name.endsWith(".sql") && name <= "20261121010000_account_profile_editing.sql").sort()) {
      await db.exec(await readFile(new URL(file, migrations), "utf8"));
    }
    const mother = "a7000000-0000-4000-8000-000000000001";
    const supporter = "a7000000-0000-4000-8000-000000000002";
    const newcomer = "a7000000-0000-4000-8000-000000000003";
    for (const id of [mother, supporter, newcomer])
      await db.query("insert into auth.users(id,email,email_confirmed_at) values ($1,$2,now())", [id, `user-${id}@example.invalid`]);
    const asUser = (id, operation) => db.transaction(async tx => {
      await tx.exec("set local role authenticated");
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
      return operation(tx);
    });
    const onboard = (id, name, purpose) => asUser(id, tx => tx.query("select public.prohor_save_role_profile($1,$2,'','',$3)",
      [name, [purpose], JSON.stringify({ phone: "", district: "", careStage: "", supporterType: "", qualification: "", specialty: "", serviceArea: "" })]));
    await onboard(mother, "Synthetic mother", "mother");
    await onboard(supporter, "Synthetic supporter", "supporter");
    const update = (id, name, details) => asUser(id, tx => tx.query("select public.prohor_update_profile($1,$2) as account", [name, JSON.stringify(details)]));

    const saved = (await update(mother, "  Ayesha  ", { phone: "+880 1700-000000", district: "Dhaka", area: "Mirpur", dateOfBirth: "1998-04-12",
      bloodGroup: "B+", emergencyName: "Karim", emergencyRelation: "Husband", emergencyPhone: "01700000001", careStage: "pregnant" })).rows[0].account;
    assert.equal(saved.displayName, "Ayesha");
    assert.equal(saved.details.bloodGroup, "B+");
    assert.equal(saved.details.qualification, "", "keys not sent are kept");
    // Partial update merges: the phone stays when only the district changes.
    const merged = (await update(mother, "Ayesha", { district: "Gazipur" })).rows[0].account;
    assert.equal(merged.details.district, "Gazipur");
    assert.equal(merged.details.phone, "+880 1700-000000");
    // Editing details never changes roles.
    assert.deepEqual(merged.roles, [{ role: "mother", status: "approved" }]);

    for (const bad of [{ bloodGroup: "Z+" }, { phone: "call me" }, { dateOfBirth: "2999-01-01" }, { dateOfBirth: "1998-02-30" },
      { careStage: "unknown" }, { role: "provider" }, { phone: 5 }])
      await assert.rejects(update(mother, "Ayesha", bad), { code: "22023" }, JSON.stringify(bad));
    await assert.rejects(update(mother, "   ", {}), { code: "22023" });
    await assert.rejects(update(newcomer, "Not onboarded", {}), { code: "22023" });

    const invite = (scopes) => asUser(mother, tx => tx.query("select public.prohor_invite_supporter($1,$2,now()+interval '7 days') as invite", [supporter, scopes]));
    await assert.rejects(invite(["visit_preparation", "visit_preparation"]), { code: "22023" });
    await assert.rejects(invite(["read_records"]), { code: "22023" });
    const allAreas = ["visit_preparation", "appointment_company", "transport", "medicine_reminders", "nutrition_meals", "household_help",
      "emotional_support", "paperwork_costs", "care_coordination", "baby_care", "emergency_contact"];
    await invite(allAreas);
    const connections = (await asUser(mother, tx => tx.query("select public.prohor_supporter_connections() as list"))).rows[0].list;
    assert.deepEqual(connections[0].scopes, allAreas);
  } finally { await db.close(); }
});
