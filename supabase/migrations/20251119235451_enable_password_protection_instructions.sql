/*
  # Enable Leaked Password Protection (Manual Setup Required)

  ## Overview
  This migration serves as documentation for enabling Leaked Password Protection
  in Supabase Auth. This feature requires manual configuration through the 
  Supabase Dashboard.

  ## What is Leaked Password Protection?
  
  Supabase Auth integrates with HaveIBeenPwned.org Pwned Passwords API to prevent
  users from using passwords that have been compromised in data breaches.
  
  When enabled, users attempting to use a leaked password will receive:
  - Error message: "Password has been leaked"
  - Status code: 422
  
  ## Requirements
  
  - **Plan**: Supabase Pro Plan or higher (not available on Free plan)
  - **Access**: Project owner or admin access to Supabase Dashboard
  
  ## How to Enable (Manual Steps)
  
  1. Go to your Supabase Dashboard
  2. Navigate to: **Authentication → Settings**
  3. Find the "Password Security" or "Password Protection" section
  4. Toggle ON "Leaked password protection"
  5. Save changes
  
  ## Benefits
  
  - Prevents users from using compromised passwords
  - Reduces account takeover risk
  - Enhances overall application security
  - No additional code changes needed
  
  ## Impact on Users
  
  - Existing users with leaked passwords: Will be prompted to change password on next login
  - New users: Cannot sign up with leaked passwords
  - OAuth users: Not affected (no password used)
  
  ## Notes
  
  - This setting cannot be configured via SQL migration
  - Must be enabled through Supabase Dashboard
  - Free plan users will see a warning but cannot enable this feature
  - If you only use OAuth authentication, this setting is not required
  
  ## Verification
  
  After enabling, test by attempting to create an account with a common 
  password (e.g., "password123") to verify the protection is active.
  
  ---
  
  This is an informational migration and does not execute any SQL commands.
*/

-- No SQL commands needed - this is configuration-based, not schema-based
SELECT 'Leaked Password Protection must be enabled manually in Supabase Dashboard' as notice;
