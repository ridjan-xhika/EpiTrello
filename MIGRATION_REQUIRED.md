# ⚠️ IMPORTANT: Database Migration Required

## Before Using Advanced Card Features

The advanced Trello features require new database tables. Please run the migration SQL in phpMyAdmin:

### Steps:
1. Open phpMyAdmin at http://localhost:8080
2. Select the `trello_mvp` database
3. Go to the SQL tab
4. Copy the migration SQL from the bottom of `server/src/database.sql` (starting with "-- MIGRATION SQL FOR EXISTING DATABASES")
5. Execute the SQL

### Migration creates these tables:
- `card_labels` - Colored tags for cards
- `card_checklists` - Checklist containers
- `card_checklist_items` - Individual checklist items
- `card_attachments` - File attachments
- `card_comments` - Discussion threads  
- `card_members` - Assigned users
- `card_activity` - Complete audit log

### New card fields added:
- `due_date` - Task deadline
- `start_date` - When work begins
- `completed` - Completion status
- `time_estimate` - Estimated minutes
- `time_spent` - Actual minutes spent
- `priority` - low/medium/high/critical
- `cover_color` - Card cover color

## Features Implemented

### ✅ Backend (Complete)
- Extended Card model with 20+ methods
- 40+ new API routes for all features
- Permission checks on all routes
- Activity logging system

### ✅ Frontend (Complete)
- CardModal component with full feature UI
- Badge display on cards
- Label picker with 10 colors
- Checklist creation and management
- Comment threads with timestamps
- Due date picker with status indicators
- Priority selector
- Time tracking display
- Member assignment
- Activity timeline
- Responsive design matching Trello

### 🎨 Trello-like Features
- Labels (10 preset colors)
- Checklists with progress bars
- Due dates with overdue detection
- Comments with user avatars
- Priority levels (Low/Medium/High/Critical)
- Time estimates and tracking
- Card covers
- Member assignment
- Complete activity log
- Drag-and-drop (already working)

## Usage

Once migration is complete, you can:
- Click any card to open the advanced modal
- Add labels by clicking "Labels" in sidebar
- Create checklists with "Checklist" button
- Set due dates with "Due Date" button
- Add comments in the Activity section
- Set priority with "Priority" button
- Mark cards complete
- Track time estimates vs spent
- View all changes in activity log

All features respect permission levels - read-only users can view but not edit.
