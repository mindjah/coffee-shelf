/**
 * OAuth client ID for "Back up to Google Drive" (Google Cloud Console → Credentials → Web
 * application). It is public by design. VITE_GOOGLE_CLIENT_ID overrides it (used by tests);
 * an empty value hides the Google Drive section.
 */
export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '1070550439815-0eguk16pr72tp96ta120t7ipdk284afh.apps.googleusercontent.com'
