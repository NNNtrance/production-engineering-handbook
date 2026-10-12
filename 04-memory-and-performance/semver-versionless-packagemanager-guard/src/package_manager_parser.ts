// raineorshine/npm-check-updates PR #2067 by @onuracar-dev
// Prevents crash when package.json contains versionless packageManager: "pnpm"

const parsePackageManager = (pkgData: PackageFile) => {
  if (!pkgData.packageManager) return {}
  
  // Corepack allows bare declarations: "packageManager": "pnpm"
  // Naive split('@') returns ['pnpm', undefined]
  const [name, version] = pkgData.packageManager.split('@')

  // BUG: returning { [name]: version } caused downstream semver.valid()
  // to throw TypeError on undefined version, aborting the entire upgrade!

  // FIX: safely verify version presence before building dependency record:
  return version ? { [name]: version } : {}
}