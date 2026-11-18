/** Disposable SQL fixtures only. Never import into app code or a hosted runner. */
export async function establishFixtureRole(db, userId, role, approved = true) {
  const hasOnboarding = (await db.query("select to_regprocedure('public.prohor_complete_onboarding(text,text[],text,text)') is not null as available")).rows[0].available;
  if (!hasOnboarding) {
    await db.query("update public.profiles set role=$2,display_name=$3 where user_id=$1", [userId, role, `Synthetic ${role}`]);
    return;
  }
  // Exercise the other session's forward onboarding boundary, without changing it.
  await db.transaction(async tx => {
    await tx.exec("set local role authenticated");
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [userId]);
    await tx.query("select public.prohor_complete_onboarding($1,$2::text[],$3,$4)", [
      `Synthetic ${role}`, [role === "provider" ? "chw" : role], role === "provider" ? "Synthetic practice" : "", "",
    ]);
  });
  if (role === "provider" && approved) {
    // Trusted disposable administrator; ordinary clients cannot approve providers.
    await db.query("select public.prohor_review_provider($1,true,'Synthetic test administrator')", [userId]);
  }
}
