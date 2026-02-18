import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXT_PRIVATE_SUPABASE_JWT_SECRET!;
const SUPABASE_REF = "hdabvnxtxzbfemnqwfyd";

/**
 * Sign a per-device JWT for Supabase RLS.
 * Contains pc_id and user_id claims so RLS policies can scope
 * queries to the specific device. Uses the same HS256 algorithm
 * and "anon" role as the default Supabase anon key.
 */
export function signDeviceJwt(pcId: string, userId: string): string {
  if (!JWT_SECRET) {
    throw new Error("NEXT_PRIVATE_SUPABASE_JWT_SECRET is not set");
  }

  return jwt.sign(
    {
      iss: "supabase",
      ref: SUPABASE_REF,
      role: "anon",
      pc_id: pcId,
      user_id: userId,
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "365d" }
  );
}
