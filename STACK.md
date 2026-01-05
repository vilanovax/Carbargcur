# Technology Stack - Karbarg MVP

این سند شامل نسخه‌های دقیق تکنولوژی‌های استفاده شده در پروژه کاربرگ است.

## Core Stack (Latest Stable - January 2026)

### Frontend Framework
- **Next.js**: `16.1.1` (App Router)
  - Latest stable release with Turbopack
  - Full TypeScript support
  - Server & Client Components
  - Route Handlers for API

- **React**: `19.2.3`
  - Latest stable with React Compiler ready
  - Concurrent features
  - Server Components support

- **TypeScript**: `^5` (latest 5.x)
  - Modern type system
  - Full Next.js 16 compatibility

### Styling & UI

- **Tailwind CSS**: `^4` (v4.1.x)
  - Latest major version with oxide engine
  - CSS-in-JS ready
  - Better performance

- **shadcn/ui Components**:
  - `@radix-ui/react-label`: `^2.1.8`
  - `@radix-ui/react-radio-group`: `^1.3.8`
  - `@radix-ui/react-slot`: `^1.2.4`
  - Headless, accessible components

- **Styling Utilities**:
  - `tailwind-merge`: `^3.4.0` (latest v3)
  - `clsx`: `^2.1.1`
  - `class-variance-authority`: `^0.7.1`

- **Icons**:
  - `lucide-react`: `^0.562.0` (latest)

### Development Tools

- **ESLint**: `^9` (latest major)
  - `eslint-config-next`: `16.1.1`

- **PostCSS**:
  - `@tailwindcss/postcss`: `^4`

## Backend Stack (Ready to Integrate)

### Database
- **PostgreSQL**: `18.0` (Liara managed)
  - Host: `vinson.liara.cloud:34807`
  - Modern features
  - JSON support

### ORM (To Install)
- **Drizzle ORM**: `latest`
  - Type-safe queries
  - PostgreSQL native
  - Migration support

### Storage
- **Liara Object Storage** (S3-Compatible)
  - Endpoint: `storage.c2.liara.space`
  - Bucket: `bizbuzz`
  - AWS SDK v3 compatible

### Authentication (To Implement)
- **JWT**: `jose` library
  - Modern JOSE standard
  - Edge runtime compatible
  - Secure token handling

## Additional Libraries (Phase 2+)

### Forms & Validation
- `react-hook-form`: latest
- `zod`: `^4` (when stable, currently v3)

### Date & Time
- `date-fns`: latest
- `date-fns-jalali`: Persian calendar support

### Charts & Visualization
- `recharts`: latest

### File Processing
- `sharp`: Image optimization
- `@aws-sdk/client-s3`: S3 operations

## Environment

```bash
Node.js: >= 18.17 (recommended: 20.x LTS)
npm: >= 9.x
```

## Package Manager

```bash
npm (lockfile: package-lock.json)
```

## Build Output

- **Turbopack**: Development (faster than Webpack)
- **Webpack**: Production builds
- **Output**: Standalone Docker-ready

## Deployment Target

- **Platform**: Liara
- **Region**: Iran
- **Database**: Liara PostgreSQL 18.0
- **Storage**: Liara Object Storage (C2)

## Version Update Strategy

✅ **Major versions**: Stable releases only
✅ **Minor versions**: Auto-update via `^` prefix
✅ **Security patches**: Always apply
⚠️ **Breaking changes**: Test thoroughly before updating

## Update Commands

```bash
# Check for updates
npm outdated

# Update to latest within semver range
npm update

# Update specific package
npm install package@latest

# Security fixes
npm audit fix
```

## Last Updated

**Date**: 2026-01-05
**Stack Status**: ✅ All Latest Stable Versions
**Security**: ✅ Vulnerabilities in legacy deps (Next.js 16+ clean)

---

**Note**: همیشه قبل از به‌روزرسانی major version، تست کامل انجام دهید.
