BA Analysis: "User can manage projects" — Refined

---
2. Business Rules (confirmed)

┌───────┬──────────────────────────────────────────────────────────────────┐
│  ID   │                               Rule                               │
├───────┼──────────────────────────────────────────────────────────────────┤
│       │ A project has: name (required), description, status              │
│ BR-01 │ (active/archived/on-hold/completed), start date, end date, tags  │
│       │ (free-form list), color (hex or preset)                          │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-02 │ Every project has exactly one owner (the creating user)          │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-03 │ A project owner can invite team members with roles: Editor (can  │
│       │ modify) or Viewer (read-only)                                    │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-04 │ Only the owner can delete, archive, or change team member roles  │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-05 │ Deleting is a soft delete — project enters archived state; owner │
│       │  can restore within 30 days; after 30 days, permanent deletion   │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-06 │ Project name must be unique within the user's own projects (not  │
│       │ globally)                                                        │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-07 │ Each user is limited to 10 active projects (free tier); archived │
│       │  projects don't count toward the limit                           │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-08 │ Deleting a project cascades — specs and tasks become archived    │
│       │ too                                                              │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-09 │ Projects are sortable by: name, created date, last updated,      │
│       │ status                                                           │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-10 │ Projects are filterable by: status (active, archived, on-hold,   │
│       │ completed)                                                       │
├───────┼──────────────────────────────────────────────────────────────────┤
│       │ A user can clone/duplicate any project they own or have edit     │
│ BR-11 │ access to; cloned project gets "(Copy)" suffix; specs are        │
│       │ deep-copied; tasks are NOT copied                                │
├───────┼──────────────────────────────────────────────────────────────────┤
│ BR-12 │ Every new user gets one default onboarding project with sample   │
│       │ specs and tasks explaining how SpecFlow Lite works               │
└───────┴──────────────────────────────────────────────────────────────────┘

---
3. Project Model

┌───────────────┬──────────────┬──────────┬───────────────────────────────┐
│     Field     │     Type     │ Required │             Notes             │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ id            │ UUID         │ yes      │ Primary key                   │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ name          │ string (max  │ yes      │ Unique per owner              │
│               │ 100)         │          │                               │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ description   │ text         │ no       │ Rich text or plain            │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ status        │ enum         │ yes      │ active, on-hold, completed,   │
│               │              │          │ archived                      │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ start_date    │ date         │ no       │ Nullable                      │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ end_date      │ date         │ no       │ Nullable; must be ≥           │
│               │              │          │ start_date                    │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ tags          │ string[]     │ no       │ Max 10 tags, each max 30      │
│               │              │          │ chars                         │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ color         │ string       │ no       │ Hex color or preset name      │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ owner_id      │ UUID         │ yes      │ FK to user                    │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ created_at    │ timestamp    │ yes      │ Auto-set                      │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ updated_at    │ timestamp    │ yes      │ Auto-updated                  │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ archived_at   │ timestamp    │ no       │ Set on soft delete; null =    │
│               │              │          │ active                        │
├───────────────┼──────────────┼──────────┼───────────────────────────────┤
│ is_onboarding │ boolean      │ no       │ True for the auto-generated   │
│               │              │          │ default project               │
└───────────────┴──────────────┴──────────┴───────────────────────────────┘

Team members (junction table):

┌────────────┬───────────┬──────────────────┐
│   Field    │   Type    │      Notes       │
├────────────┼───────────┼──────────────────┤
│ project_id │ UUID      │ FK               │
├────────────┼───────────┼──────────────────┤
│ user_id    │ UUID      │ FK               │
├────────────┼───────────┼──────────────────┤
│ role       │ enum      │ editor or viewer │
├────────────┼───────────┼──────────────────┤
│ invited_at │ timestamp │                  │
└────────────┴───────────┴──────────────────┘

---
4. User Stories (confirmed priority)

┌───────┬───────────────────────────────────────────────────────┬──────────┐
│  ID   │                         Story                         │ Priority │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│       │ As a new user, I want an onboarding project created   │          │
│ US-01 │ automatically so that I can see how SpecFlow Lite     │ P0       │
│       │ works immediately                                     │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│       │ As a user, I want to create a project with name,      │          │
│ US-02 │ description, dates, tags, and color so I can organize │ P0       │
│       │  my specs                                             │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-03 │ As a user, I want to view my project list with        │ P0       │
│       │ sorting and filtering so I can find projects quickly  │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-04 │ As a user, I want to open a project to see its specs  │ P0       │
│       │ and tasks                                             │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-05 │ As a user, I want to edit project details so I can    │ P1       │
│       │ keep information current                              │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-06 │ As a user, I want to invite team members as Editors   │ P1       │
│       │ or Viewers so we can collaborate                      │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-07 │ As a project owner, I want to archive a project (soft │ P1       │
│       │  delete) so I can clean up without losing data        │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-08 │ As a project owner, I want to restore an archived     │ P1       │
│       │ project within 30 days                                │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-09 │ As a user, I want to clone a project (with specs but  │ P2       │
│       │ not tasks) so I can start from a template             │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│ US-10 │ As a user, I want to change a project's status        │ P2       │
│       │ (active → on-hold → completed) as work progresses     │          │
├───────┼───────────────────────────────────────────────────────┼──────────┤
│       │ As a user, I want to see a clear error when I hit the │          │
│ US-11 │  10-project limit so I know to archive before         │ P2       │
│       │ creating more                                         │          │
└───────┴───────────────────────────────────────────────────────┴──────────┘

---
5. Acceptance Criteria (key scenarios)

US-12 — Onboarding project
Scenario: New user gets onboarding project
  Given I just signed up with no projects
  When I land on the dashboard
  Then a project "Welcome to SpecFlow Lite" exists
  And it contains sample specs and tasks
  And the project is tagged "onboarding"

US-02 — Create project
Scenario: Create with full details
  Given I am authenticated with fewer than 10 active projects
  When I create a project with all fields filled
  Then the project is created with status "active"
  And I am redirected to the project detail page

Scenario: Blocked by limit
  Given I have 10 active projects
  When I try to create a new project
  Then I see "You've reached the 10-project limit. Archive a project first."
  And no project is created

Scenario: End date before start date
  Given I fill in start_date = 2026-06-15 and end_date = 2026-06-10
  When I submit
  Then I see "End date must be on or after start date"

US-06 — Invite team members
Scenario: Owner invites editor
  Given I own project "My App"
  When I invite user@example.com as Editor
  Then they appear in the team list with role "Editor"
  And they can modify specs and tasks in the project

Scenario: Non-owner cannot invite
  Given I am an Editor on "My App"
  When I try to access team management
  Then the invite option is not visible

US-07/08 — Archive and restore
Scenario: Soft delete (owner)
  Given I own project "Old Project"
  When I archive it
  Then it disappears from my active project list
  And it appears in the archived filter view
  And all its specs and tasks are archived
  And its archived_at timestamp is set

Scenario: Restore within 30 days
  Given I archived "Old Project" 5 days ago
  When I restore it
  Then it reappears in my active project list
  And its spec and task statuses are restored

Scenario: Restore blocked by limit
  Given I have 10 active projects
  And I archived "Old Project" 2 days ago
  When I try to restore it
  Then I see "Archive a project first to make room"

Scenario: Permanent deletion after 30 days
  Given "Old Project" was archived 31 days ago
  When the cleanup job runs
  Then the project and all related data are permanently deleted

US-09 — Clone project
Scenario: Clone with specs, no tasks
  Given I have access to project "API Backend"
  When I clone it
  Then a new project "API Backend (Copy)" is created
  And all specs from the original are deep-copied
  And no tasks are copied
  And the new project has status "active"

---
6. Edge Cases Identified

┌────────────────────────────────┬────────────────────────────────────────┐
│           Edge Case            │                Handling                │
├────────────────────────────────┼────────────────────────────────────────┤
│ 10-project limit includes      │ Only count projects the user owns      │
│ owned + shared projects?       │                                        │
├────────────────────────────────┼────────────────────────────────────────┤
│ What if owner leaves a         │ Ownership must be transferred first;   │
│ project?                       │ cannot leave while owner               │
├────────────────────────────────┼────────────────────────────────────────┤
│ Invited user hasn't signed up  │ Invitation pending; activates when     │
│ yet                            │ they sign up                           │
├────────────────────────────────┼────────────────────────────────────────┤
│ Color: hex or preset?          │ Both — presets for quick pick, custom  │
│                                │ hex for advanced                       │
├────────────────────────────────┼────────────────────────────────────────┤
│ Tags: case sensitivity?        │ Case-insensitive, stored lowercase,    │
│                                │ deduped                                │
├────────────────────────────────┼────────────────────────────────────────┤
│ Cloning an archived project?   │ Allowed; clone is created as active    │
├────────────────────────────────┼────────────────────────────────────────┤
│ Concurrent create at limit?    │ Optimistic — last writer to hit the DB │
│                                │  wins, first one rejected              │
└────────────────────────────────┴────────────────────────────────────────┘
