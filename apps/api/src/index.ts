/**
 * This a minimal tRPC server
 */
import { initTRPC } from '@trpc/server'
import { db } from './db'
import { z } from 'zod'
import * as trpcExpress from '@trpc/server/adapters/express'
import express from 'express'
import cors from 'cors'

// created for each request
const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({}) // no context
type Context = Awaited<ReturnType<typeof createContext>>
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create()

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure

const appRouter = router({
    user: {
        list: publicProcedure.query(async () => {
            // Retrieve users from a datasource, this is an imaginary database
            const users = await db.user.findMany()
            //    ^?
            return users
        }),
        byId: publicProcedure.input(z.string()).query(async (opts) => {
            const { input } = opts
            //      ^?
            // Retrieve the user with the given ID
            const user = await db.user.findById(input)
            return user
        }),
        create: publicProcedure.input(z.object({ name: z.string() })).mutation(async (opts) => {
            const { input } = opts
            //      ^?
            // Create a new user in the database
            const user = await db.user.create(input)
            //    ^?
            return user
        }),
    },
})

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter

// const server = createHTTPServer({
//     router: appRouter,
// })

// server.listen(3001)

const app = express();

app.use(cors())

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);


app.listen(3001);
