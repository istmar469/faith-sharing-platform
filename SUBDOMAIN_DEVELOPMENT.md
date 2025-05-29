# Subdomain Development Setup

This guide explains how to set up and test subdomain functionality in your local development environment.

## Quick Setup

### 1. Local Development URLs

For local development, use these URL patterns:

- **Main domain**: `http://localhost:8080`
- **Organization subdomains**: `http://[subdomain].localhost:8080`

Examples:
- `http://test3.localhost:8080` - Organization with subdomain "test3"
- `http://myorg.localhost:8080` - Organization with subdomain "myorg"

### 2. Browser Configuration

Most modern browsers support `.localhost` subdomains by default. If you encounter issues:

**Chrome/Edge/Safari**: Should work automatically
**Firefox**: May need `network.dns.localDomains` set to `localhost` in `about:config`

### 3. Database Setup

Ensure you have test organizations in your database:

```sql
-- Create test organizations
INSERT INTO organizations (id, name, subdomain, website_enabled) VALUES
('test-org-1', 'Test Organization', 'test3', true),
('test-org-2', 'My Organization', 'myorg', true);
```

## Development Flow

### 1. Main Domain (localhost:8080)
- Shows the main Church-OS landing page
- Allows super admin access
- Organization selection for authenticated users

### 2. Subdomain Access (test3.localhost:8080)
- Shows organization-specific content
- Loads organization context automatically
- Provides page builder for that organization
- Dashboard access scoped to the organization

## Testing Subdomain Detection

### Browser Console Tests

Open browser console and run:

```javascript
// Test all subdomain patterns
runSubdomainTests();

// Test specific hostname
testSubdomainExtraction(['test3.localhost']);
```

### Debug Panel

In development, a debug panel appears in the bottom-left corner showing:
- Current hostname and subdomain detection
- Organization context state
- Database connection status
- **NEW**: Organization table testing with subdomain queries

## Common Issues & Solutions

### Issue: "No organization found for subdomain"

**Solution**: 
1. Click "Test Organizations" in debug panel to see all organizations
2. Check if organization exists in database with correct `subdomain` field
3. Verify `subdomain` field matches URL exactly
4. Ensure `website_enabled` is `true`

### Issue: Context not loading

**Solution**:
1. Click "Test DB Connection" in debug panel
2. Click "Retry Context" in debug panel
3. Check browser console for errors
4. Verify database connection and schema

### Issue: Routing to wrong dashboard

**Solution**:
1. Clear browser cache
2. Check if URL has organization context
3. Verify tenant context is properly set

## Database Verification

Use the debug panel's "Test Organizations" button to:
- See all organizations in your database
- Test the exact subdomain query being used
- Verify your test organization exists

Or check manually:
```sql
-- Check all organizations
SELECT id, name, subdomain, website_enabled FROM organizations;

-- Check specific subdomain
SELECT * FROM organizations WHERE subdomain = 'test3';
```

## Example URLs for Testing

```
# Main domain access
http://localhost:8080                    # Public landing page
http://localhost:8080/dashboard          # Organization selection
http://localhost:8080/dashboard/org-id   # Specific org dashboard

# Subdomain access
http://test3.localhost:8080              # Organization landing page
http://test3.localhost:8080/dashboard    # Organization dashboard
http://test3.localhost:8080/page-builder # Page builder for org
```

## Troubleshooting Steps

1. **Open Debug Panel**: Click "Debug Context" in bottom-left corner
2. **Test Database**: Click "Test DB Connection" 
3. **Check Organizations**: Click "Test Organizations" to see all orgs and test subdomain query
4. **Verify Console**: Look for logs prefixed with "TenantContext:"
5. **Retry Context**: Use "Retry Context" button if needed

The enhanced debug panel now shows you exactly what organizations exist and whether your subdomain query is working!

## Architecture Overview

### Context Flow
1. **URL Analysis**: `extractSubdomain()` detects subdomain from hostname
2. **Domain Check**: `isMainDomain()` determines if it's main domain or subdomain
3. **Organization Lookup**: Database query to find organization by subdomain
4. **Context Setting**: `TenantContext` stores organization info
5. **Routing**: Components render based on context

### Key Files
- `src/utils/domain/` - Domain detection utilities
- `src/components/context/TenantContext.tsx` - Tenant context provider
- `src/components/routing/RootRouter.tsx` - Main routing logic
- `src/components/debug/ContextDebugPanel.tsx` - Development debugging

## Production vs Development

### Development (`localhost`)
- Uses `.localhost` subdomains
- Debug panel available
- Relaxed domain validation

### Production (`church-os.com`)
- Uses real subdomains (`org.church-os.com`)
- No debug panel
- Strict domain validation

## Dashboard Modules

Each organization dashboard includes:

### Core Modules
- **Overview**: Stats and quick actions
- **Page Builder**: Edit public website using Puck
- **Events**: Event management
- **Forms**: Contact and signup forms
- **Members**: Member management
- **Donations**: Donation tracking (coming soon)

### Navigation
- Subdomain access: Clean URLs (`/dashboard`, `/page-builder`)
- Main domain: Organization-scoped URLs (`/dashboard/org-id`)

## Troubleshooting

### Enable Debug Mode
1. Open browser console
2. Check debug panel in bottom-left
3. Look for console logs prefixed with "TenantContext:"

### Manual Context Reset
```javascript
// In browser console
window.location.reload(); // Simple refresh
// Or force context retry via debug panel
```

### Verify Database
```sql
-- Check organizations
SELECT id, name, subdomain, website_enabled FROM organizations;

-- Check specific subdomain
SELECT * FROM organizations WHERE subdomain = 'test3';
```

## Best Practices

1. **Always test both main and subdomain access**
2. **Use debug panel during development**
3. **Check console logs for context information**
4. **Verify database state before testing**
5. **Test authentication flow on both domain types**

## Example URLs for Testing

```
# Main domain access
http://localhost:8080                    # Public landing page
http://localhost:8080/dashboard          # Organization selection
http://localhost:8080/dashboard/org-id   # Specific org dashboard

# Subdomain access
http://test3.localhost:8080              # Organization landing page
http://test3.localhost:8080/dashboard    # Organization dashboard
http://test3.localhost:8080/page-builder # Page builder for org
```

This setup provides a complete multi-tenant experience in development while maintaining the same architecture that will work in production. 