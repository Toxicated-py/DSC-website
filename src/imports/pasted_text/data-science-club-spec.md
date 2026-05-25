Make a full fledged website


What I you want to build?

I want to make a website for Data Science Club. It is based on Nepal. it is a student club made my students of Bachelor in Data Science from School of Mathematical Sciences at TU. The Club focuses on Data Science, AI, Ml, workshops, and many more  

To make sure we build the right thing, let's start with the main purpose. When you imagine this website, is it primarily a digital "brochure" to tell the world about the club and attract new members, or is it more of a functional "hub" where current members can actively collaborate and do things?

A mix of both (Public pages for visitors, plus a private area for members).

You mentioned that the club focuses on workshops. How deeply do you want the website to handle these? We could go from just showing a simple list of dates to a full-blown event management system.

A full system where students can register, get tickets, and maybe even check-in digitally.

I also added the design




THe specifications


Specification
Overview

Data Science Club: The digital home for Data Science students at Tribhuvan University.

Data Science Club (with future branding as Data Sarthi) is the digital home for the student community of Bachelor in Data Science at the School of Mathematical Sciences, Tribhuvan University (TU), Nepal. Delivered as a mobile-first responsive web application, the platform serves dual purposes: a public-facing showcase for prospective members and achievements, and a functional membership hub for active collaboration.

The public layer features an interactive project gallery showcasing student AI/ML work, a blog for technical achievements, and a dynamic event calendar. The private layer provides verified students (@sms.tu.edu.np) with seamless event registration, digital ticketing with QR-based check-in, and project submission workflows. Club membership requires additional manual verification, unlocking content creation privileges.

The platform emphasizes fluid, app-like interactions over static document browsing—featuring gesture-based navigation, real-time capacity indicators, animated state transitions, and progressive disclosure of content.
User Journeys
1. Public Discovery and Student Onboarding
1.1. Initial Discovery (Public Access)

    1.1.1. Visitor lands on mobile-optimized landing page showing hero section with club mission
    1.1.2. Visitor scrolls/swipes through preview carousel of upcoming events and featured projects without authentication
    1.1.3. Visitor navigates to About section to view club history, leadership team, and contact information
    1.1.4. Visitor browses Project Gallery with filterable categories (Machine Learning, Data Visualization, AI Research)
    1.1.5. Visitor reads Blog posts with markdown-rendered content and code syntax highlighting
    1.1.6. Visitor attempts to register for an event, triggering authentication gate

1.2. Student Verification (Automated)

    1.2.1. User selects "Join as TU Student" registration path
    1.2.2. User enters institutional email ending in @sms.tu.edu.np
    1.2.3. System instantly verifies domain and sends magic link/OTP to email
    1.2.4. User confirms email and sets profile (name, batch year, profile photo)
    1.2.5. System grants "Verified Student" status with access to event registration
    1.2.6. User sees option to "Apply for Club Membership" for additional privileges

1.3. Club Membership Application (Manual Verification)

    1.3.1. Verified Student navigates to Membership section or dashboard banner
    1.3.2. Student fills application form with motivation statement and interests (AI/ML/Data Engineering)
    1.3.3. System marks application as "Pending Review" and notifies admins
    1.3.4. Admin reviews application and approves/rejects with optional feedback
    1.3.5. On approval, student receives notification and gains "Club Member" role with content creation rights

2. Event Registration and Digital Ticketing
2.1. Event Discovery and Registration

    2.1.1. User browses Events list with visual cards showing date, title, and live capacity indicator (e.g., "18/30 spots remaining")
    2.1.2. User filters events by type (Workshop, Guest Lecture, Hackathon) and status (Open, Closing Soon, Full)
    2.1.3. User taps event to view detail page with markdown description, speaker bio, prerequisites, and venue map
    2.1.4. System shows registration button state based on capacity:
        If available: "Reserve Spot" primary action
        If full: "Join Waitlist" with position number
        If closing soon: Urgency indicator with countdown
    2.1.5. User confirms registration with single tap
    2.1.6. System generates unique ticket with QR code and adds to "My Tickets" collection
    2.1.7. User receives confirmation with calendar invite (.ics) and reminder preferences

2.2. Ticket Management

    2.2.1. User navigates to "My Tickets" dashboard
    2.2.2. User views upcoming events list with quick-action to view ticket
    2.2.3. User taps ticket to reveal fullscreen QR code with animated refresh indicator
    2.2.4. User can download ticket PDF or add to mobile wallet (optional)
    2.2.5. User can cancel registration (if before deadline), freeing spot for waitlist
    2.2.6. System sends push notification reminders 24 hours and 1 hour before event

3. Event Check-in (Organizer Flow)
3.1. QR Code Scanning

    3.1.1. Organizer (Admin/Event Manager) opens Check-In interface from dashboard
    3.1.2. Camera view activates with QR frame overlay and torch toggle for low light
    3.1.3. Organizer scans attendee's QR code from their mobile device
    3.1.4. System validates ticket in real-time:
        Success: Haptic feedback, green confirmation flash, displays attendee name/photo and timestamp
        Already Checked In: Yellow warning with previous check-in time
        Invalid/Wrong Event: Red error with details
    3.1.5. System updates attendance count live and syncs across all organizer devices
    3.1.6. Organizer can view real-time attendance statistics (checked in vs. registered)

3.2. Manual Check-in Fallback

    3.2.1. Organizer switches to "Manual Search" mode
    3.2.2. Organizer types attendee name or registration ID
    3.2.3. System displays filtered list with avatar and registration details
    3.2.4. Organizer taps "Check In" button with confirmation swipe to prevent accidents
    3.2.5. System records manual check-in with organizer attribution

4. Project Showcase and Curation
4.1. Project Submission (Club Members)

    4.1.1. Club Member navigates to "Submit Project" from dashboard
    4.1.2. Member completes multi-step form:
        Step 1: Metadata (Title, Category, Team Members, Technologies Used)
        Step 2: Summary (Short description for gallery card, thumbnail image upload)
        Step 3: Full Content (Markdown editor with preview toggle, image gallery upload, code snippet support)
    4.1.3. Member saves as draft or submits for review
    4.1.4. On submit, system notifies admins and shows "Under Review" status to member

4.2. Admin Curation

    4.2.1. Admin accesses Project Review Queue from admin panel
    4.2.2. Admin sees list of submitted projects with submission date and author
    4.2.3. Admin previews full project rendering (markdown, images, code blocks)
    4.2.4. Admin provides feedback and selects:
        Publish: Goes live to public gallery immediately
        Request Changes: Returns to member with comments
        Reject: Archives with reason
    4.2.5. Member receives notification of status change

4.3. Public Consumption

    4.3.1. Visitor browses Project Gallery with masonry/grid layout
    4.3.2. Visitor uses category filters and search (by tech stack, author, title)
    4.3.3. Visitor taps project card to expand summary view (thumbnail, short description, tags)
    4.3.4. Visitor taps "Read Full Case Study" to navigate to dedicated project page
    4.3.5. Project page renders full markdown content with:
        Syntax-highlighted code blocks
        Zoomable image gallery
        Author attribution with links to profiles
        Related projects suggestions

5. Content Creation and Blog Management
5.1. Blog Publishing

    5.1.1. Club Member or Admin creates new blog post
    5.1.2. Member uses markdown editor with split-screen preview
    5.1.3. Member adds cover image, tags, and SEO summary
    5.1.4. Member schedules publish time or publishes immediately
    5.1.5. Post appears in public blog feed with "New" badge for 48 hours

5.2. Content Interaction

    5.2.1. Users read blog posts with optimized mobile typography
    5.2.2. Users share posts via native share API (Web Share API)
    5.2.3. Users copy code snippets with tap-to-copy buttons
    5.2.4. Users navigate between posts via "Next/Previous" swipe gestures

6. Admin Operations
6.1. Event Management

    6.1.1. Admin creates new event with markdown description editor
    6.1.2. Admin sets capacity limit, waitlist options, and registration deadline
    6.1.3. Admin uploads event cover image and sets category tags
    6.1.4. Admin monitors registration dashboard with exportable attendee lists (CSV)
    6.1.5. Admin can manually add/remove registrants and override capacity for VIPs

6.2. Member Management

    6.2.1. Admin views pending membership applications with applicant details
    6.2.2. Admin bulk-approves or individual-reviews applications
    6.2.3. Admin manages user roles (Student, Member, Organizer, Admin)
    6.2.4. Admin can suspend accounts for code of conduct violations

Data Model
User

Represents platform users with tiered access levels.

Fields:

    id: UUID primary key
    email: String, unique, must end with @sms.tu.edu.np for automatic verification
    passwordHash: String, bcrypt hashed
    fullName: String, display name
    avatarUrl: String, optional profile image URL
    role: Enum [unverified, student, member, organizer, admin]
    membershipStatus: Enum [na, pending, approved, rejected], only applicable for role=member
    batchYear: Number, graduation year
    bio: Text, optional markdown short bio
    emailVerified: Boolean, true for @sms.tu.edu.np on registration
    createdAt: Timestamp
    updatedAt: Timestamp

Relationships:

    Has many Registration (event tickets)
    Has many Project (as author)
    Has many BlogPost (as author)
    Has many CheckIn (as scanner, for organizers)
    Has many MembershipApplication

Event

Represents workshops, lectures, and club activities.

Fields:

    id: UUID primary key
    title: String, event name
    slug: String, URL-friendly identifier
    description: Text, markdown content
    shortDescription: String, 140 chars for cards
    eventType: Enum [workshop, lecture, hackathon, social, other]
    startTime: Timestamp, event start
    endTime: Timestamp, event end
    venue: String, location name
    venueMapUrl: String, optional Google Maps link
    capacity: Integer, maximum attendees
    registrationOpen: Boolean, controls visibility of registration
    registrationDeadline: Timestamp, cutoff for new registrations
    coverImageUrl: String, hero image
    status: Enum [draft, published, cancelled, completed]
    createdBy: FK User (admin/organizer)
    createdAt: Timestamp
    updatedAt: Timestamp

Relationships:

    Has many Registration
    Has many CheckIn (through registrations)

Registration

Represents a student's reservation for an event.

Fields:

    id: UUID primary key
    eventId: FK Event
    userId: FK User
    ticketCode: String, unique QR code content (hashed)
    status: Enum [registered, checked_in, cancelled, no_show]
    waitlistPosition: Integer, null if not on waitlist
    registeredAt: Timestamp
    checkedInAt: Timestamp, nullable
    cancellationReason: String, optional

Relationships:

    Belongs to Event
    Belongs to User
    Has one CheckIn (when checked_in)

CheckIn

Records of attendance verification at events.

Fields:

    id: UUID primary key
    registrationId: FK Registration
    eventId: FK Event
    scannedByUserId: FK User (organizer who scanned)
    scannedAt: Timestamp
    method: Enum [qr_scan, manual_search]
    deviceInfo: String, optional user agent/device type

Relationships:

    Belongs to Registration
    Belongs to Event
    Belongs to User (scanner)

Project

Showcase of student data science work.

Fields:

    id: UUID primary key
    title: String, project name
    slug: String, URL-friendly identifier
    summary: String, 280 chars for gallery cards
    content: Text, full markdown case study
    thumbnailUrl: String, cover image
    galleryUrls: Array of Strings, additional images
    category: Enum [machine_learning, data_viz, nlp, computer_vision, other]
    technologies: Array of Strings, tech stack tags
    authorId: FK User (submitter)
    status: Enum [draft, submitted, published, rejected, archived]
    adminFeedback: Text, optional curation notes
    submittedAt: Timestamp
    publishedAt: Timestamp, nullable
    viewCount: Integer, analytics

Relationships:

    Belongs to User (author)
    Has many ProjectCollaborator (additional team members)

BlogPost

News and achievement announcements.

Fields:

    id: UUID primary key
    title: String, headline
    slug: String, URL identifier
    summary: String, excerpt for listings
    content: Text, markdown body
    coverImageUrl: String, optional
    authorId: FK User
    status: Enum [draft, published, archived]
    publishedAt: Timestamp, nullable
    tags: Array of Strings
    viewCount: Integer

Relationships:

    Belongs to User (author)

MembershipApplication

Queue for manual club membership approval.

Fields:

    id: UUID primary key
    applicantId: FK User
    motivationStatement: Text, why they want to join
    interests: Array of Strings, areas of interest
    status: Enum [pending, approved, rejected]
    reviewedById: FK User, nullable (admin who processed)
    reviewNotes: Text, optional feedback
    submittedAt: Timestamp
    reviewedAt: Timestamp, nullable

Relationships:

    Belongs to User (applicant)
    Belongs to User (reviewer)

Frontend
Common
Navigation Structure

Public Navigation (Unauthenticated):

    Sticky top bar with hamburger menu containing: About, Events, Projects, Blog, Login
    Smooth scroll to sections on landing page
    Bottom CTA bar on mobile prompting "Join the Club"

Member Navigation (Authenticated):

    Bottom tab bar (mobile-optimized) with: Home, Events, My Tickets, Projects, Profile
    Floating action button (FAB) for quick event registration or project submission (context-aware)
    Pull-to-refresh on list views

Admin Navigation:

    Top admin bar when in management mode with: Dashboard, Events, Projects, Members, Check-in
    Contextual secondary actions in bottom sheet (mobile) or sidebar (desktop breakpoint)

Interactive Patterns

Gesture Support:

    Swipe left/right on event cards to navigate dates/weeks
    Swipe up on project cards to expand summary to full view
    Pull down to refresh lists
    Long press on tickets to reveal options (cancel, share)

Micro-interactions:

    Animated counters when registration spots decrease
    Haptic feedback on successful check-in
    Skeleton screens during data loading
    Staggered entrance animations for list items

QR Code Display:

    Full-screen modal with high-contrast QR code
    Auto-brightness boost when displaying code
    Timestamp indicator showing code freshness

Landing Page

The primary public-facing entry point featuring a hero section, previews of events/projects/blogs, and calls to action for membership.
Contents

Primary entry point showcasing club identity and value proposition.

Content Hierarchy:

    Hero section with club name and tagline ("Data Science Club - School of Mathematical Sciences, TU")
    Horizontal scrollable "Upcoming Events" preview with capacity indicators
    Featured Projects grid with hover/tap scale effects
    Latest Blog posts excerpt cards
    Call-to-action section for membership application
    Footer with contact, social links, and "Data Sarthi" future branding mention

Interactions:

    Tap event preview card navigates to EventDetailPage
    Tap project preview expands to ProjectDetailPage
    Swipe hero section cycles through featured content
    Sticky "Join Now" button appears on scroll
    Tap "About" in menu navigates to AboutPage

About Page

A static informational page displaying club history, mission, leadership team profiles, and contact details.
Contents

Static information page for the club.

Content Hierarchy:

    Hero section with "About Data Science Club"
    Club history and mission text
    Leadership team section with profiles (names, roles, photos)
    Contact information (email, social media links)
    Section mentioning future branding "Data Sarthi"

Interactions:

    Tap social icons to open external links
    Tap "Back" to return to LandingPage

Login Page

The authentication entry point allowing students to log in with email/password or a magic link, featuring real-time domain validation.
Contents

Authentication entry with domain verification.

Content Hierarchy:

    Email input with real-time domain validation (@sms.tu.edu.np check)
    Password field with visibility toggle
    "Send Magic Link" alternative to password
    Link to Registration for new users
    "Forgot Password" recovery flow

States:

    Loading state during verification
    Error state for non-institutional emails
    Success transition with profile completion prompt

Register Page

The registration flow for new students, including account details input, email verification, and optional profile photo upload.
Contents

Account creation with institutional verification.

Content Hierarchy:

    Email input with instant validation
    Full name and batch year fields
    Password creation with strength indicator
    Terms acceptance checkbox
    "Apply for Membership" toggle (optional during registration)

Post-Registration Flow:

    Email verification screen with resend option
    Profile photo upload step (skipable)
    Onboarding completion animation

Events List Page

A browsable list of events with filtering capabilities (Upcoming, Past, My Events) and search functionality.
Contents

Browse and discover club events.

Content Hierarchy:

    Segmented control for filter: Upcoming | Past | My Events
    Search bar with type-ahead suggestions
    Vertical list of event cards showing:
        Cover image with date badge
        Title and truncated description
        Capacity indicator (progress bar or "X spots left")
        Event type tag (color-coded)
    Floating filter chip for category selection

Interactions:

    Tap card expands to EventDetailPage
    Pull down refreshes list
    Infinite scroll for past events
    Tap capacity indicator shows waitlist info if full
    If user is on waitlist and a spot opens, they receive a notification

Event Detail Page

Detailed view of a specific event including description, speaker info, and registration controls, handling various event states like full or completed.
Contents

Comprehensive event information and registration.

Content Hierarchy:

    Hero image with gradient overlay and back button
    Event title, date/time block, and venue with map link
    Markdown-rendered description with collapsible sections
    Speaker/Host profile cards (if applicable)
    Prerequisites section (collapsible)
    Registration status bar showing:
        Current capacity (e.g., "24 of 30 registered")
        Registration deadline countdown
        Primary action button (Register/Join Waitlist/Registered/Closed)

Conditional Logic:

    If Event is "Completed": Hide registration controls, display "This event has ended" message.
    If Event is "Full": Show "Join Waitlist" button.

Modal Overlays:

    Registration Confirmation: Summary of event details, checkbox for "Add to Calendar", Confirm button
    Success State: Animated confirmation with ticket preview and "View My Tickets" CTA
    Waitlist Join: Position confirmation with "You'll be notified if a spot opens"

Ticket View Page

The user's digital ticket for a specific event, featuring a QR code for check-in and status management options.
Contents

Digital ticket presentation for event entry.

Content Hierarchy:

    Event title and datetime header
    Large format QR code centered on screen
    Attendee name and ID below code
    Check-in status indicator (Pending/Checked In)
    Venue directions button
    Cancel registration option (if allowed by event settings)

Interactions:

    Tap QR code to enlarge to fullscreen
    Long press to show options menu (Share, Cancel)
    Share action triggers native Web Share API
    Cancel action prompts for confirmation, frees spot, and notifies next waitlist member
    Swipe up for event details

Check-in Scanner Page

An organizer-only interface for scanning QR codes to check in attendees, featuring camera view and manual search fallback.
Contents

Organizer interface for event attendance.

Content Hierarchy:

    Camera viewfinder occupying full screen
    Corner brackets framing scan area
    Torch toggle and camera switch (front/back) controls
    Last scan result banner (success/warning) with attendee name
    Manual search button (bottom sheet trigger)
    Live counter: "Checked In: X / Registered: Y"

States:

    Scanning: Active camera with scanning animation
    Success: Green overlay flash, attendee photo and name display, audio beep
    Error: Red overlay, error reason (Already checked in, Invalid ticket, Wrong event)
    Manual Mode: Searchable list of registrants with avatar and check-in button

Projects Gallery Page

A public gallery showcasing student projects in a grid layout with filtering by category and search capabilities.
Contents

Showcase of student data science projects.

Content Hierarchy:

    Category filter chips (horizontal scroll)
    Masonry/grid layout of project cards containing:
        Thumbnail image
        Title and author
        Technology tags
        Short summary (2 lines)
        "Read Case Study" indicator
        Status badge (Draft, Published, Under Review) visible to author
    Search bar with tech stack filters

Interactions:

    Tap card navigates to ProjectDetailPage with summary expansion
    Filter chips animate on selection
    Staggered load animation for cards
    Empty state with "Submit First Project" CTA for members

Project Detail Page

A detailed view of a single project including hero image, author info, markdown-rendered case study, and related projects.
Contents

Full case study display.

Content Hierarchy:

    Hero image with title overlay
    Author attribution with batch year
    Technology tags row
    Markdown content rendered with:
        Typography hierarchy (H1-H6)
        Syntax-highlighted code blocks with copy buttons
        Image gallery with pinch-to-zoom
        Blockquote styling for key insights
    "Related Projects" carousel at bottom
    Admin controls (Edit, Unpublish) if user has permissions

Interactions:

    Swipe down to dismiss/return to gallery (modal behavior on mobile)
    Tap images for fullscreen lightbox view
    Share button generates link with preview
    Code blocks have tap-to-copy functionality

Project Submission Page

A multi-step form allowing members to submit projects, including metadata entry, content editing, preview, and final submission.
Contents

Member workflow for submitting new projects.

Content Hierarchy:

    Step indicator: Details → Content → Preview → Submit
    Step 1 (Details): Title input, category selector, technology tags input (comma separated), thumbnail upload
    Step 2 (Content): Markdown editor with toolbar (bold, italic, code block, link, image), live preview toggle
    Step 3 (Preview): Rendered view as it will appear public
    Step 4 (Submit): Confirmation checklist, Submit button

Interactions:

    Access Control: If user is not a 'member' or 'admin', redirect to MembershipApplicationPage with error message.
    Auto-save drafts to local storage
    Image upload with drag-drop (desktop) or camera/gallery (mobile)
    Preview mode switches editor to rendered view
    Validation prevents submission without required fields
    Success animation on submit, then redirects to ProjectsGalleryPage with filter applied to show user's projects (status "Under Review")

Blog List Page

The main feed for blog posts, featuring a highlighted latest post and a chronological list of articles.
Contents

News and articles feed.

Content Hierarchy:

    Featured post hero (latest)
    Chronological list of posts with:
        Cover image
        Title and summary
        Author and read time
        Publication date
    Tag cloud filter (collapsible)

Interactions:

    Tap post navigates to BlogPostPage
    Swipe left on post for quick share
    Load more on scroll

Blog Post Page

A reading view for a single blog post with cover image, markdown content, and author bio.
Contents

Individual article view.

Content Hierarchy:

    Cover image with parallax scroll effect
    Title and metadata (author, date, tags)
    Markdown content body
    Author bio card at bottom
    Previous/Next post navigation

Interactions:

    Scroll progress indicator (optional thin bar)
    Tap code blocks to copy
    Share via native API
    Swipe right to go back to list

Blog Submission Page

The editor interface for creating and publishing blog posts, featuring a markdown editor, preview toggle, and publishing controls.
Contents

Interface for Club Members and Admins to create or edit blog posts.

Content Hierarchy:

    Header with "Create New Post" or "Edit Post" title
    Back button (discards draft with confirmation)
    Form fields:
        Title Input (Text)
        Cover Image Upload (File input with preview)
        Summary Input (Text, max 140 chars)
        Tags Input (Comma-separated text)
        Content Editor (Markdown textarea with toolbar: Bold, Italic, Link, Code, Image, List)
    Sticky bottom bar with actions:
        "Save Draft" button
        "Preview" toggle button
        "Publish" primary button (or "Update" if editing)

Interactions:

    Markdown editor supports syntax highlighting for code blocks
    "Preview" toggle switches the view to a read-only rendered version of the markdown
    Auto-saves drafts to local storage every 30 seconds
    Image upload allows camera capture (mobile) or file selection
    "Publish" opens a confirmation modal summarizing the post metadata
    On successful publish, redirects to the published BlogPostPage or BlogListPage

Membership Application Page

A form for verified students to apply for club membership, handling submission, pending status, and rejection feedback.
Contents

Form for verified students to apply for official Club Membership.

Content Hierarchy:

    Header with "Apply for Membership" title
    Application status banner (if previously submitted: Pending, Rejected)
    Form fields (disabled if status is Pending):
        Motivation Statement (Textarea with placeholder: "Why do you want to join the Data Science Club?")
        Areas of Interest (Selectable tags or checkboxes: AI/ML, Data Engineering, Data Viz, Research, Hackathons)
        Additional Skills/Notes (Optional textarea)
    Submit button ("Submit Application")
    Info card explaining benefits of membership (project submission rights, blog writing, voting rights)

Interactions:

    Form validation ensures motivation statement is not empty
    Upon submission, show loading spinner
    Success state: Displays confirmation message "Application Submitted! We will review it shortly."
    If rejected previously, show feedback notes from admin in a warning box and allow re-submission
    Navigation back to MemberDashboardPage after submission

Member Dashboard Page

A personalized dashboard for members showing upcoming events, project status, activity feed, and quick action links.
Contents

Personal hub for active members.

Content Hierarchy:

    Welcome header with name and membership status badge
    "My Upcoming Events" section (next 3 events with quick ticket access)
    "My Projects" status (drafts, under review, published counts)
    Recent activity feed (check-ins, comments, approvals)
    Quick actions: Submit Project, Register for Event, Write Blog Post

Interactions:

    Tap event card opens TicketViewPage
    Tap project status opens ProjectSubmissionPage (edit mode)
    Pull down refresh
    Notification bell with unread count

Admin Event Management Page

The administrative interface for managing events, including creating events, editing details, viewing attendee lists, and managing registrations.
Contents

Backend for event creation and monitoring.

Content Hierarchy:

    List of events with status badges (Draft, Open, Closed, Completed)
    "Create Event" primary button
    Event editor with:
        Title and slug auto-generation
        Markdown description editor
        Date/time pickers with timezone support (Asia/Kathmandu default)
        Capacity limit input with waitlist toggle
        Cover image upload with crop
    Attendee list view per event with:
        Searchable table
        Check-in status filters
        Export CSV button
        Manual add attendee

Interactions:

    Real-time capacity preview updates
    Draft auto-save
    Toggle registration open/closed with confirmation
    Bulk actions on attendee list (check in all, export)
    Manual Add: Search user by name/email, select to create registration. System generates ticket and sends notification to user.

Admin Project Review Page

The interface for admins to review submitted projects, allowing them to approve, reject, or request changes with feedback.
Contents

Curation interface for submitted projects.

Content Hierarchy:

    Queue view: Pending | Approved | Rejected tabs
    Project review card showing:
        Thumbnail and metadata
        Author details
        Full content preview (rendered markdown)
        Action buttons: Approve, Request Changes, Reject
    Feedback text input for rejections/requests

Interactions:

    Swipe gestures for quick approve/reject (with undo)
    Side-by-side comparison mode (original vs edited, if applicable)
    Batch approval for multiple submissions Notification: On status change (Approve/Reject/Request Changes), system triggers notification to the project author.

Admin Member Approval Page

The admin interface for reviewing and approving student membership applications.
Contents

Manual verification queue.

Content Hierarchy:

    List of pending applications with:
        Applicant profile summary
        Batch year and email
        Motivation statement preview
        Interest tags
    Detail view with full application
    Action buttons: Approve, Reject (with reason), Hold

Interactions:

    Quick approve from list view
    Bulk selection for batch processing
    Email preview of acceptance/rejection message
    Integration with user role update Notification: On approval or rejection, system triggers notification/email to the applicant.

Profile Settings Page

The settings page allowing users to manage their profile, notification preferences, password, and account status.
Contents

User account management.

Content Hierarchy:

    Profile photo upload with crop
    Name and bio editor (markdown supported for bio)
    Notification preferences (Email, Push toggles for events, announcements)
    Password change section
    Membership status display (with reapply option if rejected)
    Logout button

Interactions:

    Photo upload with preview
    Form auto-save
    Confirmation dialogs for destructive actions Logout: Clears session and redirects to LandingPage.