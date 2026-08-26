## What we are building

An app where users can post unwanted household items they are giving away for free. They place the item outside on their porch, curb, driveway, or pickup area, take a photo, add a short description, and pin the location. Other users nearby can browse free items on a map or feed and go pick them up.

## Required screens


### Auth

1. Welcome / Onboarding
/(auth)/index
App logo + tagline — sets tone, earthy/warm vibe
Sign In button — navigates to login screen
Create Account button — navigates to register screen
Browse as guest link — skips auth, lands on feed

2. Sign In
/(auth)/login
Email field — with validation
Password field — show/hide toggle, using Input component
Sign In button — submits loginSchema
Forgot password link — navigates to reset screen
No account? Register link
Error toast — invalid credentials feedback

3. Register
/(auth)/register
Name field
Email field
Password field
Agree to guidelines checkbox — required, per registerSchema
Create Account button
Already have account? Sign in link

4. Forgot Password
/(auth)/forgot-password
Email field — user enters their email
Send reset link button
Back to sign in link
Success state — confirmation message after submission

### Dashboard

5. Feed
/(tabs)/feed
DashboardHeader — logo + user menu
Category filter chips — horizontal scroll, maps to ListingCategory enum
Radius selector — e.g. 1km / 5km / 10km / 25km pill toggle
Listing cards (FlatList) — image thumb, title, condition badge, distance, time ago
Pull-to-refresh
Skeleton loaders — while fetching
Empty state — 'Nothing on the porch nearby'
+ Post item FAB — bottom right, auth-gated

6. Map
/(tabs)/map
Full-screen map — react-native-maps or expo-maps
Listing pin clusters — tappable, shows count
Pin tap → mini card — bottom sheet preview with title, image, distance
Category filter chips — same as feed, overlaid at top
My location button — re-centers on user
Open full listing button — from mini card

7. Inbox
/(tabs)/inbox
Auth gate — prompt to sign in if guest
Thread list — per conversation: other user avatar+name, listing thumbnail, last message preview, unread badge, time ago
Unread indicator — bold text + green dot
Empty state — 'No messages yet'
Pull-to-refresh

8. Profile
/(tabs)/profile
Auth gate — prompt if guest
Avatar + name + bio
Edit profile button — navigates to edit screen
My listings tab/section — grid of own listings with status badges
Stats row — e.g. X listings posted
Settings link
Sign out button

### Listings

9. Listing Detail
/listing/[id]
Image carousel — swipeable, full-width
Title + condition badge + category badge
Status pill — AVAILABLE / PICKED_UP / EXPIRED / REMOVED
Description
Address / distance — approximate, not exact coords
Posted by row — avatar, name, tap → public profile
Post date / time ago
Comments section — list + add comment input (auth-gated)
Message poster button — auth-gated, opens thread
Report button — kebab menu / overflow
Owner actions — Edit, Mark as Picked Up, Delete (owner only)

10. Create Listing
/listing/create
Image picker — up to N photos, camera or library
Title field — min 3, max 80
Description textarea — optional, max 500
Category select — ListingCategory enum
Condition select — ListingCondition enum
Location picker — map pin or use current location
Address field — optional human-readable
Post button — submits CreateListingSchema + images

11. Edit Listing
/listing/[id]/edit
Same fields as Create — pre-populated
Status selector — AVAILABLE / PICKED_UP (owner can update)
Image management — remove existing, add new
Save changes button — submits UpdateListingSchema
Delete listing option — destructive, confirm dialog

### Messaging

12. Message Thread
/messages/[threadId]
Header — other user name + avatar, listing context chip
Message bubbles — sent right (primary), received left (muted)
Timestamp grouping — date separators
Real-time updates — Socket.io, new messages append
Read receipts — subtle 'seen' indicator
Compose bar — text input + send button, KeyboardAvoidingView
Listing context banner — tappable, shows listing the thread is about

### User

13. Public Profile
/user/[id]
Avatar + name + bio
Member since date
Active listings grid — only AVAILABLE ones
Message button — auth-gated
Report user button — overflow menu, auth-gated
Block user option — overflow menu, auth-gated

14. Edit Profile
/profile/edit
Avatar picker — change photo (Cloudinary)
Name field
Bio textarea — max 200
Save button — submits UpdateProfileSchema

15. Settings
/settings
Notification preferences — messages, new nearby listings (SwitchField)
Location radius default — saved preference
Account section — change email / password links
Privacy — block list management
About / legal links
Sign out — destructive
Delete account — destructive, confirm flow

### Modals and sheets

16. Report Sheet
(modal) report
Reason selector — ReportReason enum: SPAM, INAPPROPRIATE, ALREADY_TAKEN, FAKE, OTHER
Details textarea — optional, max 300
Submit button
Cancel

17. Image Viewer
(modal) image-viewer
Full-screen image — pinch-to-zoom
Swipe between images
Close button — top left X
Image counter — '2 / 5'

18. Confirm Delete / Action
(modal) confirm
Title + description — e.g. 'Delete this listing?'
Confirm button — destructive variant
Cancel button

## Stacks being used

- Forms - Tanstack form
- UI Component Library - HeroUI
- State Management - Zustand

## Custom prompt

Only use colors that can be found in this project's global.css file. No custom/hardcoded colors
Follow DRY principle and create reusable components and function utilites if necessary
While HeroUI is being used as the main component type for this project, Every primitive component used in this project should be coming from components/ui folder.. This means that if a component is not there, you have to wrap and export it from components/ui