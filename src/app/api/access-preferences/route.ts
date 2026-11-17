import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/api-response";
import {
  DEFAULT_ACCESS_PREFERENCES,
  accessPreferencesSchema,
  saveAccessPreferencesRequestSchema,
} from "@/lib/contracts/adapt";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const client = await createServerSupabase();
    if (!client) {
      return jsonNoStore(
        { message: "Preference sync service is not configured." },
        503,
      );
    }

    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return jsonNoStore({ message: "Authentication required." }, 401);
    }

    const { data, error } = await client
      .from("access_preferences")
      .select("settings, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return jsonNoStore(
        { message: "Could not retrieve access preferences." },
        500,
      );
    }

    if (!data) {
      return jsonNoStore(
        {
          settings: DEFAULT_ACCESS_PREFERENCES,
          schemaVersion: 2,
          updatedAt: null,
        },
        200,
      );
    }

    const parsed = accessPreferencesSchema.safeParse(data.settings);
    const settings = parsed.success ? parsed.data : DEFAULT_ACCESS_PREFERENCES;

    return jsonNoStore(
      {
        settings,
        schemaVersion: 2,
        updatedAt: data.updated_at,
      },
      200,
    );
  } catch {
    return jsonNoStore(
      { message: "An unexpected error occurred while reading preferences." },
      500,
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await createServerSupabase();
    if (!client) {
      return jsonNoStore(
        { message: "Preference sync service is not configured." },
        503,
      );
    }

    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return jsonNoStore({ message: "Authentication required." }, 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonNoStore({ message: "Invalid JSON in request body." }, 400);
    }

    const validation = saveAccessPreferencesRequestSchema.safeParse(body);
    if (!validation.success) {
      return jsonNoStore(
        {
          message: "Invalid access preferences request payload.",
          errors: validation.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        400,
      );
    }

    const { settings, expectedUpdatedAt } = validation.data;
    const nowIso = new Date().toISOString();

    if (expectedUpdatedAt === null) {
      // First-time preference record creation
      const { data: inserted, error: insertError } = await client
        .from("access_preferences")
        .insert({
          user_id: user.id,
          settings,
          updated_at: nowIso,
        })
        .select("settings, updated_at")
        .maybeSingle();

      if (insertError) {
        // Postgres unique violation: row was inserted concurrently by another session
        if (insertError.code === "23505") {
          return jsonNoStore(
            {
              message:
                "A cloud preferences record already exists for this account. Please refresh.",
              conflict: true,
            },
            409,
          );
        }
        return jsonNoStore(
          { message: "Could not create access preferences." },
          500,
        );
      }

      const parsedSettings = accessPreferencesSchema.safeParse(
        inserted?.settings ?? settings,
      );

      return jsonNoStore(
        {
          settings: parsedSettings.success ? parsedSettings.data : settings,
          updatedAt: inserted?.updated_at ?? nowIso,
        },
        200,
      );
    }

    // Atomic optimistic update: matching user_id AND expectedUpdatedAt
    const { data: updated, error: updateError } = await client
      .from("access_preferences")
      .update({
        settings,
        updated_at: nowIso,
      })
      .eq("user_id", user.id)
      .eq("updated_at", expectedUpdatedAt)
      .select("settings, updated_at")
      .maybeSingle();

    if (updateError) {
      return jsonNoStore(
        { message: "Could not update access preferences." },
        500,
      );
    }

    // If no row matched the condition, check if the record was modified concurrently or deleted
    if (!updated) {
      const { data: current } = await client
        .from("access_preferences")
        .select("updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      return jsonNoStore(
        {
          message:
            "Cloud preferences were modified on another device. Please reload the latest settings.",
          conflict: true,
          currentUpdatedAt: current?.updated_at ?? null,
        },
        409,
      );
    }

    const parsedSettings = accessPreferencesSchema.safeParse(updated.settings);

    return jsonNoStore(
      {
        settings: parsedSettings.success ? parsedSettings.data : settings,
        updatedAt: updated.updated_at,
      },
      200,
    );
  } catch {
    return jsonNoStore(
      { message: "An unexpected error occurred while saving preferences." },
      500,
    );
  }
}

export async function DELETE() {
  try {
    const client = await createServerSupabase();
    if (!client) {
      return jsonNoStore(
        { message: "Preference sync service is not configured." },
        503,
      );
    }

    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return jsonNoStore({ message: "Authentication required." }, 401);
    }

    const { error: deleteError } = await client
      .from("access_preferences")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      return jsonNoStore(
        { message: "Could not delete cloud preferences record." },
        500,
      );
    }

    return jsonNoStore(
      {
        message: "Cloud preferences deleted successfully.",
        deleted: true,
      },
      200,
    );
  } catch {
    return jsonNoStore(
      { message: "An unexpected error occurred while deleting preferences." },
      500,
    );
  }
}
