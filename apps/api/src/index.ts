import { initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { db } from './db'

/**
 * trpc setup
 */

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({}) // no context
type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

const router = t.router
const publicProcedure = t.procedure

/**
 * trpc router
 */

const appRouter = router({
    user: {
        list: publicProcedure.query(async () => {
            const users = await db.user.findMany()
            return users
        }),
        byId: publicProcedure.input(z.number()).query(async (opts) => {
            const { input } = opts
            const user = await db.user.findById(input)
            return user
        }),
        create: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async (opts) => {
            const { input } = opts
            const user = await db.user.create(input)
            return user
        }),
        delete: publicProcedure.input(z.number()).mutation(async (opts) => {
            const { input } = opts
            await db.user.deleteById(input)
            return null
        }),
    },
})

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter

/**
 * Express server
 */

const app = express()

app.use(cors())

app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    })
)

app.listen(3001)
