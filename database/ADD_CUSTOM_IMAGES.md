# Add Custom Image Fields to Users Table

## Required Database Changes

To enable custom profile pictures and banner images, you need to add two new columns to the `users` table in your Supabase database.

### Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS custom_profile_image TEXT,
ADD COLUMN IF NOT EXISTS custom_banner_image TEXT;
```

### What This Does:

- **custom_profile_image**: Stores the URL of the user's custom-uploaded profile picture (overrides Twitter profile image if set)
- **custom_banner_image**: Stores the URL of the user's custom-uploaded banner image (overrides Twitter banner if set)

### How It Works:

1. When a user first authenticates with Twitter, their Twitter profile image and banner are automatically fetched and stored in `profile_image_url` and `banner_image_url`
2. Users can upload custom images in `/settings` which are stored in `custom_profile_image` and `custom_banner_image`
3. The app displays custom images if available, otherwise falls back to Twitter images
4. Users can remove custom images to revert back to their Twitter images

### Where To Run This:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Paste the SQL above
5. Click "Run"

That's it! The feature will work immediately after adding these columns.
