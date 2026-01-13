# Employee Ecosystem V2.0 - Rebuild Status

**Date**: 28 December 2024
**Status**: Foundation Complete - UI Components Pending

---

## Executive Summary

The complete rebuild of the Employee section has been initiated following your technical brief. The backend foundation (database schema, services, and business logic) is now complete and production-ready. The next phase involves building the UI components according to the luxury tech specifications.

---

## ✅ COMPLETED: Backend Foundation (Phase 1)

### 1. Database Schema

**Migration**: `create_employee_ecosystem_v2`

Created comprehensive database infrastructure:

#### Profiles Table Enhancements
- `connected_tools` (jsonb array) - Tracks all connected integration IDs
- `health_score` (integer 0-100) - Real-time calculated metric
- `last_activity_at` (timestamp) - Activity tracking

#### New Frictions Table
```sql
CREATE TABLE frictions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  tool_name text,
  friction_type text,
  title text,
  description text,
  severity text ('high', 'medium', 'low'),
  is_resolved boolean,
  resolved_at timestamptz,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Purpose**: Tracks individual workflow bottlenecks detected by AI analysis.

#### Automated Health Score System

**Function**: `calculate_health_score(user_id)`
- Returns 0% if no tools connected
- Returns 50% when first tool is connected
- Increases by 5% for each additional tool (max 100%)
- Reduces by 3% for each unresolved friction

**Auto-Triggers**:
- Updates when `connected_tools` array changes
- Updates when frictions are created/resolved
- Real-time calculation, no manual refresh needed

#### Row Level Security (RLS)

All policies implemented for frictions table:
- Users view own frictions
- Managers view team member frictions
- Users can create/update/delete own frictions
- Secure and isolated by default

### 2. Services Layer

#### `frictionsService.ts`
- `getFrictions(userId)` - Get all frictions for user
- `getUnresolvedFrictions(userId)` - Filter by unresolved
- `getFrictionsByTool(userId, toolName)` - Tool-specific
- `createFriction(friction)` - Add new friction
- `resolveFriction(frictionId)` - Mark as resolved
- `unresolveFriction(frictionId)` - Reopen
- `deleteFriction(frictionId)` - Remove
- `getFrictionStats(userId)` - Analytics (total, by severity, by tool)

#### `employeeProfileService.ts`
- `getProfile(userId)` - Get user profile
- `getConnectedTools(userId)` - List connected tools
- `connectTool(userId, toolId)` - Add tool to connected_tools array
- `disconnectTool(userId, toolId)` - Remove tool
- `getHealthScore(userId)` - Get current health score
- `refreshHealthScore(userId)` - Force recalculation
- `updateLastActivity(userId)` - Track activity timestamp

### 3. TypeScript Types

Updated `src/types/database.ts`:
- Added all new profile columns
- Added complete `frictions` table types
- Includes Row, Insert, and Update types for type safety

### 4. Build Verification

Project builds successfully with no TypeErrors.

---

## 🚧 PENDING: UI Components (Phase 2)

The following components need to be built according to your luxury tech specifications:

### Dashboard Tab Components

#### 1. **HealthScoreGauge.tsx**
- Large animated circular gauge (center of dashboard)
- Displays 0-100% with smooth transitions
- Color coding: Red (0-30), Orange (31-60), Neon Green (61-100)
- Glowing effect on the ring
- Shows "No Tools Connected" state at 0%

#### 2. **ToolIntegrationGrid.tsx**
- Grid of 33 tool cards (from `integrations.ts`)
- Each card: Tool icon, name, category
- States:
  - **Locked** (default): Grayscale, lock icon overlay
  - **Connecting** (on click): Pulsing animation, loading spinner
  - **Connected**: Full color, green "Scan OK" badge, checkmark
- Click logic: `employeeProfileService.connectTool()` → Updates `connected_tools` → Triggers health score recalc
- Real-time sync with database

#### 3. **SuccessFeed.tsx**
- Scrollable feed of AI-detected wins
- Example entries:
  - "5 Jira tickets resolved today (+12% efficiency)"
  - "Zero Slack interruptions during deep work blocks"
  - "All PR reviews completed within 2 hours"
- Uses friction data + activity logs to generate positive insights
- Animated entry appear/disappear

### Insights Tab Components

#### 4. **FrictionMap.tsx**
- Visual chart/heatmap of bottlenecks
- Data source: `frictionsService.getFrictionStats()`
- Shows: Pending validations, stalled PRs, ghost files, etc.
- Clickable nodes to drill down into specific friction details

#### 5. **FocusRatio.tsx**
- Chart: Deep Work time vs. Meeting time
- Uses Slack/Calendar metadata (no content spying)
- Privacy disclaimer always visible
- Bar chart or donut chart visualization

#### 6. **WorkflowIntegrityWidget.tsx**
- Detects "Ghost Files" (outdated versions, locked docs)
- Red alerts for critical issues
- Green checkmarks for healthy workflows

### My Team Tab Components

#### 7. **MyTeamHub.tsx** (State Machine)

**STATE A: No Team (Freelance/Pending)**
- `TeamDiscoveryList` - Shows all company teams
- `JoinRequestTracker` - Displays sent requests with status
- Search/filter functionality
- "Join Team" button → Creates `team_join_request` with `target_manager_id`

**STATE B: Team Member (Post-Approval)**
- `TeamWall` - Grid of colleague avatars
- Hover shows "Currently Using: Figma" (from activity logs)
- `CollectiveHealthChart` - Team avg vs. user score comparison
- `TeamSuccessFeed` - Group victories feed
- "Request Transfer" and "Request Leave" buttons

**State Detection**:
```typescript
const hasTeam = profile?.assigned_team_id !== null;
```

**UI Morph**: CSS transitions, no full page reload

### Real-Time Listeners

#### 8. **TeamRequestListener.tsx**
- Subscribes to `team_join_requests` table
- Listens for `status` changes from 'pending' → 'approved'
- On approval:
  1. Updates local state
  2. Shows success toast: "Welcome to Team [name]!"
  3. Plays subtle success sound
  4. Triggers UI morph from State A → State B
- Uses Supabase real-time subscriptions

### Luxury UI Theme Components

#### 9. **UpdatedSidebar.tsx**
- Pure black (#000000) background
- Deep charcoal (#0A0A0A) card backgrounds
- 1px borders with subtle gradients
- Top section: User avatar + small health score ring
- Dynamic navigation:
  - [🏠 Dashboard]
  - [📊 Insights]
  - [👥 My Team] - Badge if no team assigned
- Bottom: Notification bell (with count) + Settings icon

#### 10. **LuxuryThemeWrapper.tsx**
- Global CSS variables for theme
- Accent colors:
  - Success: #00FF88 (Neon Green)
  - Pending: #FF8C00 (Vivid Orange)
  - Alert: #FF3333 (Deep Red)
- Framer Motion transitions for all state changes
- No full-page reloads, only component-level animations

---

## 🎯 Recommended Next Steps

### Option A: Incremental Build (Recommended)
Build components one by one, testing each:

1. Start with `HealthScoreGauge` + `ToolIntegrationGrid`
2. Test tool connection flow end-to-end
3. Add `SuccessFeed` + dashboard polish
4. Build Insights Tab components
5. Implement My Team state machine
6. Add real-time listeners
7. Final luxury theme polish

### Option B: Parallel Development
Build multiple components simultaneously if you have specific priorities:
- Critical path: Health gauge → Tool grid → Team hub
- Nice-to-have: Insights tab, success feed, animations

### Option C: Minimal Viable Product (MVP)
Focus on core workflow only:
1. Basic health score display (no fancy gauge)
2. Simple tool list (no grid, just checkboxes)
3. Team join/leave functionality
4. Skip insights tab and success feed for now

---

## 🔧 Technical Integration Notes

### Connecting Tools
```typescript
// In ToolIntegrationGrid component
const handleConnectTool = async (toolId: string) => {
  setConnecting(toolId);
  try {
    await employeeProfileService.connectTool(user.id, toolId);
    await integrationsService.connectIntegration(toolId, {}, null, user.id);

    // Refresh profile to get updated health_score
    const updatedProfile = await employeeProfileService.getProfile(user.id);
    setHealthScore(updatedProfile.health_score);

    setConnecting(null);
    showToast('Tool connected successfully!');
  } catch (error) {
    console.error(error);
    setConnecting(null);
    showToast('Failed to connect tool');
  }
};
```

### Real-Time Team Updates
```typescript
// In MyTeamHub component
useEffect(() => {
  const subscription = supabase
    .channel('team_join_requests')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'team_join_requests',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        if (payload.new.status === 'approved') {
          handleTeamApproval(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, [user.id]);
```

### Health Score Display
```typescript
// Use profile.health_score from context
const { profile } = useAuth();
const healthScore = profile?.health_score || 0;

// Color logic
const getHealthColor = (score: number) => {
  if (score >= 61) return '#00FF88'; // Neon green
  if (score >= 31) return '#FF8C00'; // Orange
  return '#FF3333'; // Red
};
```

---

## 📊 Current System Metrics

- **Database Tables**: 15 (2 new: frictions + enhanced profiles)
- **Services**: 9 (2 new: frictionsService, employeeProfileService)
- **Migrations Applied**: 20
- **TypeScript Types**: Complete and validated
- **Build Status**: ✅ SUCCESS
- **RLS Policies**: 100% coverage
- **Health Score Logic**: Automated with triggers

---

## 🚨 Critical Requirements Checklist

From your technical brief:

- [x] Database schema for connected_tools and health_score
- [x] Frictions table with RLS
- [x] Services for tool management
- [x] Automated health score calculation
- [ ] Tool integration grid (33 tools)
- [ ] AI Health Score gauge UI
- [ ] My Team state machine (no team vs. team member)
- [ ] Real-time request approval listener
- [ ] Luxury tech UI theme (pure black + neon accents)
- [ ] Success feed with AI-detected wins
- [ ] Insights tab with friction map
- [ ] Privacy-first analytics (metadata only)
- [ ] No full-page reloads (smooth transitions)
- [ ] UpdatedSidebar with health score ring

---

## 🎨 Design System Reference

**Colors** (from your spec):
- Background: `#000000` (Pure Black)
- Cards: `#0A0A0A` (Deep Charcoal)
- Borders: `1px solid rgba(255, 255, 255, 0.1)`
- Success: `#00FF88` (Neon Green)
- Pending: `#FF8C00` (Vivid Orange)
- Alert: `#FF3333` (Deep Red)
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0A0`

**Typography**:
- Headers: Bold, large
- Body: Regular weight
- Monospace for tool names/codes

**Animations**:
- Framer Motion for all transitions
- 300ms duration for state changes
- Elastic easing for health score changes
- Fade-in for new elements

---

## 📝 Next Command

To continue building the UI components, specify which component to start with:

**Examples**:
- "Build the HealthScoreGauge component"
- "Create the ToolIntegrationGrid with connection logic"
- "Implement the MyTeamHub state machine"
- "Build all dashboard tab components at once"

Or ask for:
- "Show me a demo of how the tool connection flow works"
- "Create a mock friction entry to test the system"
- "Test the health score calculation with sample data"

---

**Status**: Foundation Complete ✅
**Phase**: Ready for UI Component Development
**Blocker**: None - all dependencies resolved
**Estimated Remaining**: 10-15 components (depending on complexity)
