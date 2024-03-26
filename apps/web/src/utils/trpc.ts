import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { AppRouter } from 'api'

export const trpc = createTRPCNext<AppRouter>({
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
