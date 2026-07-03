# Baby Birthday Sweepstake

A one-page pink-themed family sweepstake website.

## What it does

- Shows July, August and September 2026
- Displays the name on each occupied date
- Allows one guess per person
- Allows one person per date
- Updates for visitors when a new guess is added
- Does not take payments; collect the £2 privately

## 1. Create the Supabase database

1. Create a free Supabase project.
2. Open **SQL Editor**.
3. Paste in `supabase-schema.sql` and run it.
4. Open **Project Settings → API**.
5. Copy the Project URL and publishable/anon key.
6. Put both values into `config.js`.

The publishable key is intended for browser use. Never paste a Supabase secret/service-role key into this project.

## 2. Test locally

The easiest VS Code option:

1. Install the **Live Server** extension.
2. Right-click `index.html`.
3. Choose **Open with Live Server**.

Do not double-click the file and run it as `file://`, because browser/network behaviour can differ.

## 3. Publish free with GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save. GitHub will display the public site address after deployment.

## Changing the year

Update `YEAR` in `config.js`, and update both date ranges in `supabase-schema.sql` before running the SQL.

## Important limitations

This starter intentionally has no login, so anyone who knows the public URL can submit a guess. Database constraints prevent duplicate names/dates, but do not prevent a stranger from entering a fake name. For a small family group, share the URL privately. For stronger protection, add sign-in, one-time invite links, or a server-side invitation code.

## Editing or deleting a guess

Use the Supabase **Table Editor → guesses** table. Website visitors cannot update or delete guesses.


## Adding the baby scan photo

1. Save the scan image as `baby-scan.jpg`.
2. Put it in the same folder as `index.html`.
3. Refresh the website.

A JPG image is simplest, but you can also use PNG by changing `baby-scan.jpg` to `baby-scan.png` inside `index.html`.

For privacy, consider cropping out names, hospital numbers, dates of birth, or other personal medical information before publishing the image.
