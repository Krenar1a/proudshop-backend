// Prisma has been removed from this project.
// This stub remains only to avoid import errors during migration.
// Any attempt to use it at runtime will throw.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy({}, {
  get() {
    throw new Error('Prisma has been removed. This module is a stub.');
  }
})
