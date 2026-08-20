export function hasVersionConflict(currentVersion: number, expectedVersion?: number) {
  return expectedVersion !== undefined && currentVersion !== expectedVersion
}
