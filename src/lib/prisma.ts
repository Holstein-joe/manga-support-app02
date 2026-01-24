import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
    }
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Lazy initialization using a Proxy
const prismaProxy = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
    get(target, prop) {
        if (!globalThis.prisma) {
            globalThis.prisma = prismaClientSingleton()
        }
        return (globalThis.prisma as any)[prop]
    },
})

export default prismaProxy

if (process.env.NODE_ENV !== 'production') globalThis.prisma = undefined // Let it be lazy


