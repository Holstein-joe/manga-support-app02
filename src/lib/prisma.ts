// import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: any }

export const prisma = {} as any;

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

