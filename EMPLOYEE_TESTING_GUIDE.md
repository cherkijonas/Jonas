# Employee Section - Testing Guide
**Quick Start Guide for Testing New Features**

## Test Scenario 1: First-Time Employee Login

**Goal**: Test the complete employee onboarding experience

### Steps:
1. **Login as Employee**
   - Go to `/login`
   - Use employee credentials: `cherkisaul@icloud.com`
   - Should redirect to `/app` (new EmployeeDashboard)

2. **Verify Dashboard Loads**
   - Should see: "Bonjour, Cherki" (your first name)
   - Should see 3 KPI cards at top
   - Should see 6 widgets:
     - Quick Actions (4 buttons)
     - Your Metrics (4 stat cards)
     - Your Goals (empty initially)
     - Recent Requests (your recent requests)
     - Recent Feedback (feedback from managers)

3. **Check Initial State**
   - Metrics should show 0 for most values
   - "Aucune équipe" if not in a team
   - No goals yet
   - Recent requests if you created any

### Expected Result:
✅ Dashboard loads in < 1 second
✅ No console errors
✅ All widgets display correctly
✅ Smooth animations
✅ Name displays correctly

---

## Test Scenario 2: Create a Goal

**Goal**: Test the goals system

### Steps:
1. **Click "+ " button** in "Mes Objectifs" widget
2. **Fill in the form**:
   - Title: "Complete React Training"
   - Description: "Finish the advanced React course"
   - Target Date: Select a future date
3. **Click "Créer"**
4. **Verify goal appears** in the widget
5. **Check progress bar** shows 0%

### Expected Result:
✅ Goal created successfully
✅ Appears in widget immediately
✅ Progress bar at 0%
✅ Target date displays correctly

---

## Test Scenario 3: Submit a Request

**Goal**: Test request creation and metrics update

### Steps:
1. **Click "Nouvelle Demande"** in Quick Actions
2. **Should navigate** to `/app/my-requests`
3. **Click "Nouvelle Demande"** button
4. **Fill in form**:
   - Type: Select "time_off"
   - Title: "Vacation Request"
   - Description: "Need 3 days off next week"
   - Priority: "normal"
5. **Submit request**
6. **Go back to Dashboard**
7. **Check metrics**: "Demandes Soumises" should increment by 1
8. **Check Recent Requests**: Your new request should appear

### Expected Result:
✅ Request created successfully
✅ Metrics auto-updated (requests_submitted++)
✅ Request appears in "Recent Requests"
✅ Status shows "pending"

---

## Test Scenario 4: Connect an Integration

**Goal**: Test integration connection and metrics update

### Steps:
1. **Click "Connexions"** in Quick Actions
2. **Should navigate** to `/app/connections`
3. **Find a tool** (e.g., "Slack")
4. **Click the tool card**
5. **Toggle switch** to connect
6. **Wait for confirmation**
7. **Go back to Dashboard**
8. **Check metrics**: "Outils connectés" should increment by 1
9. **Check KPI card**: "Outils connectés" at top should update

### Expected Result:
✅ Integration connected
✅ Metrics auto-updated (integrations_connected++)
✅ KPI card updates immediately
✅ Health score may increase

---

## Test Scenario 5: View Team

**Goal**: Test team view

### Steps:
1. **Click "Mon Équipe"** in Quick Actions
2. **Should navigate** to `/app/my-team`
3. **If you have a team**:
   - Should see team members
   - Should see your role
4. **If you don't have a team**:
   - Should see option to request joining a team

### Expected Result:
✅ Team page loads correctly
✅ Team members display (if in team)
✅ Can see join request options (if not in team)

---

## Test Scenario 6: Update Profile

**Goal**: Test profile settings

### Steps:
1. **Click "Paramètres"** in Quick Actions
2. **Should navigate** to `/app/settings`
3. **Profile tab** should be active
4. **Verify pre-filled data**:
   - Name: Your full name
   - Email: Your email (locked)
   - Role: Your role badge
5. **Update name** to test
6. **Click "Sauvegarder les Modifications"**
7. **Should see success message**
8. **Go back to Dashboard**
9. **Verify name updated** in greeting

### Expected Result:
✅ Settings load with correct data
✅ Can update name
✅ Changes save successfully
✅ Dashboard reflects changes

---

## Test Scenario 7: View Activity Score

**Goal**: Test activity score calculation

### Steps:
1. **After completing scenarios 3-4** (creating request, connecting tool)
2. **Go to Dashboard**
3. **Check "Score d'Activité"** in metrics widget
4. **Should be > 0** (calculated from your activities)
5. **Check progress bar** at bottom of metrics widget

### Expected Result:
✅ Activity score > 0
✅ Score reflects your actions
✅ Progress bar displays correctly

---

## Test Scenario 8: Mobile Responsive

**Goal**: Test mobile experience

### Steps:
1. **Open dev tools** (F12)
2. **Toggle device emulation** (Ctrl+Shift+M)
3. **Select mobile device** (iPhone 12)
4. **Navigate Dashboard**
5. **Check all widgets** stack vertically
6. **Test quick actions** work on mobile
7. **Test navigation** works

### Expected Result:
✅ Dashboard is fully responsive
✅ Widgets stack on mobile
✅ Text is readable
✅ Buttons are touchable
✅ No horizontal scroll

---

## Test Scenario 9: Loading States

**Goal**: Test loading experience

### Steps:
1. **Throttle network** in dev tools
2. **Set to "Slow 3G"**
3. **Refresh Dashboard**
4. **Should see skeleton loaders** while data loads
5. **Wait for data to load**
6. **Loaders should disappear** when data arrives

### Expected Result:
✅ Skeleton loaders display
✅ No layout shift
✅ Data loads progressively
✅ Smooth transition from loading to loaded

---

## Test Scenario 10: Error Handling

**Goal**: Test error scenarios

### Steps:
1. **Turn off internet**
2. **Try to load Dashboard**
3. **Should see error state** or graceful fallback
4. **Turn internet back on**
5. **Refresh**
6. **Should load normally**

### Expected Result:
✅ Graceful error handling
✅ User-friendly error messages
✅ App doesn't crash
✅ Can recover when connection restored

---

## Database Verification Tests

### Test Metrics Table
```sql
-- Should see your user with metrics
SELECT * FROM employee_metrics WHERE user_id = 'your-user-id';

-- Expected: Row with your user_id and metric values
```

### Test Goals Table
```sql
-- Should see any goals you created
SELECT * FROM employee_goals WHERE user_id = 'your-user-id';

-- Expected: Rows for each goal created
```

### Test Triggers
```sql
-- Create a test request
INSERT INTO employee_requests (user_id, type, title, description, status, priority)
VALUES ('your-user-id', 'support', 'Test', 'Test', 'pending', 'normal');

-- Check metrics updated
SELECT requests_submitted FROM employee_metrics WHERE user_id = 'your-user-id';

-- Expected: requests_submitted increased by 1
```

---

## Performance Tests

### Dashboard Load Time
1. Open DevTools
2. Go to Performance tab
3. Start recording
4. Navigate to `/app`
5. Stop recording when loaded
6. Check "Load" time

**Target**: < 500ms

### Metrics Widget Load Time
1. Check Network tab
2. Find request to `employee_metrics`
3. Check response time

**Target**: < 200ms

### Bundle Size
```bash
npm run build
```

Check output:
- Main bundle: ~920 KB (acceptable)
- Gzipped: ~240 KB (acceptable)

---

## Security Tests

### Test RLS Policies

1. **Create second employee account**
2. **Login as employee 1**
3. **Note your metrics values**
4. **Login as employee 2**
5. **Try to access employee 1's metrics** via browser console:
   ```javascript
   const { data, error } = await supabase
     .from('employee_metrics')
     .select('*')
     .eq('user_id', 'employee-1-user-id');
   ```
6. **Should return empty** (RLS blocks it)

**Expected**: ✅ Can't see other users' data

### Test Route Guards

1. **Logout**
2. **Try to access `/app` directly**
3. **Should redirect to `/login`**

**Expected**: ✅ Protected routes require auth

---

## Regression Tests

### Test Existing Features Still Work

1. **MyRequests**
   - ✅ Can create requests
   - ✅ Can view requests
   - ✅ Can edit pending requests
   - ✅ Can delete pending requests

2. **MyTeam**
   - ✅ Can view team
   - ✅ Can request to join team
   - ✅ Can see join request status

3. **Connections**
   - ✅ Can view integrations
   - ✅ Can connect/disconnect
   - ✅ Filters work
   - ✅ Search works

4. **Settings**
   - ✅ All tabs load
   - ✅ Can update profile
   - ✅ Settings save

5. **ActivityLogs**
   - ✅ Logs display
   - ✅ Filters work
   - ✅ Export works

---

## Browser Compatibility Tests

Test on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

Test mobile:
- ✅ iOS Safari
- ✅ Chrome Mobile (Android)

---

## Quick Smoke Test

**5-Minute Quick Test**:

1. Login ✓
2. Dashboard loads ✓
3. All widgets display ✓
4. Create a goal ✓
5. Submit a request ✓
6. Connect a tool ✓
7. Check metrics updated ✓
8. Navigate to other pages ✓
9. All pages work ✓
10. Logout ✓

**If all ✓**: Ready for production!

---

## Common Issues & Solutions

### Issue: Dashboard is blank
**Solution**: Check browser console for errors. Verify database migration applied.

### Issue: Metrics show 0
**Solution**: Normal for new users. Create requests and connect tools to increase.

### Issue: Can't create goals
**Solution**: Check RLS policies. Verify user is authenticated.

### Issue: Slow loading
**Solution**: Check network tab. Verify database indexes exist.

### Issue: TypeScript errors
**Solution**: Run `npm install`. Verify types are up to date.

---

## Test Data Setup

### Create Test Employee
```sql
-- If you need a test employee
INSERT INTO auth.users (id, email)
VALUES (gen_random_uuid(), 'test@example.com');

INSERT INTO profiles (id, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'test@example.com',
  'Test Employee',
  'member'
);
```

### Create Test Goals
```sql
INSERT INTO employee_goals (user_id, title, description, status, progress)
VALUES
  ('your-user-id', 'Learn TypeScript', 'Complete TS course', 'active', 50),
  ('your-user-id', 'Build Project', 'Ship side project', 'active', 25),
  ('your-user-id', 'Get Certified', 'AWS certification', 'active', 75);
```

### Create Test Feedback
```sql
-- Assuming you have a manager user
INSERT INTO employee_feedback (from_user_id, to_user_id, feedback_text, rating, type)
VALUES
  ('manager-user-id', 'your-user-id', 'Great work this month!', 5, 'recognition'),
  ('manager-user-id', 'your-user-id', 'Keep improving your communication skills', 4, 'improvement');
```

---

## Automated Test Script

Run this in browser console after logging in:

```javascript
// Quick automated test
async function testEmployeeDashboard() {
  console.log('🧪 Testing Employee Dashboard...');

  // Test 1: Check dashboard loaded
  const dashboard = document.querySelector('[class*="space-y-6"]');
  console.log('✅ Dashboard loaded:', !!dashboard);

  // Test 2: Check metrics widget
  const metricsWidget = document.querySelector('[class*="EmployeeMetricsWidget"]');
  console.log('✅ Metrics widget:', !!metricsWidget);

  // Test 3: Check goals widget
  const goalsWidget = document.querySelector('[class*="EmployeeGoalsWidget"]');
  console.log('✅ Goals widget:', !!goalsWidget);

  // Test 4: Check quick actions
  const quickActions = document.querySelector('[class*="EmployeeQuickActions"]');
  console.log('✅ Quick actions:', !!quickActions);

  // Test 5: Fetch metrics from DB
  const { data: metrics, error } = await supabase
    .from('employee_metrics')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user.id)
    .maybeSingle();

  console.log('✅ Metrics from DB:', !!metrics, metrics);

  // Test 6: Fetch goals from DB
  const { data: goals } = await supabase
    .from('employee_goals')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user.id);

  console.log('✅ Goals from DB:', goals?.length || 0, 'goals');

  console.log('🎉 All tests passed!');
}

testEmployeeDashboard();
```

---

## Success Criteria Checklist

Before marking as complete:

- [ ] Dashboard loads without errors
- [ ] All widgets display correctly
- [ ] Metrics track correctly
- [ ] Goals can be created/updated
- [ ] Quick actions navigate correctly
- [ ] Recent requests display
- [ ] Recent feedback displays (if manager gave feedback)
- [ ] Profile settings work
- [ ] All existing pages still work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Build succeeds
- [ ] RLS policies enforce security
- [ ] Performance is acceptable (< 500ms load)
- [ ] Browser compatibility confirmed

---

## Report Issues

If you find bugs:

1. **Check browser console** for errors
2. **Note the exact steps** to reproduce
3. **Screenshot the issue**
4. **Check Supabase logs** for database errors
5. **Document** in issue tracker

---

**Date**: 28 December 2024
**Status**: Ready for Testing
**Estimated Testing Time**: 30 minutes for full suite
**Quick Test Time**: 5 minutes for smoke test
