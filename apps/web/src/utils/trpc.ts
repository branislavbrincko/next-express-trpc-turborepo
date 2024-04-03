import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { AppRouter } from 'api'

type Trpc = ReturnType<typeof createTRPCNext<AppRouter>>

export const trpc: Trpc = createTRPCNext<AppRouter>({
    config() {
        return {
            links: [
                httpBatchLink({
                    url: 'http://localhost:3001/trpc',
                }),
            ],
        }
    },
    /**
     * @link https://trpc.io/docs/v11/ssr
     **/
    ssr: false,
})
