import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

/*
cors
*/
app.use('/*', cors())

/*
routes
*/
app.get('/', (c) => c.json('Hello, Hono!'))

const AUTHORS = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']

const authors = new Hono()
    .get(
        '/',
        zValidator(
            'query',
            z.object({
                order: z.enum(['asc', 'desc']),
            })
        ),
        (c) => {
            const query = c.req.valid('query')

            const sortedAuthors = query.order === 'asc' ? AUTHORS.sort() : AUTHORS.sort().reverse()

            return c.json({
                authors: sortedAuthors,
            })
        }
    )
    .post('/', (c) => c.json('create an author', 201))
    .get('/:id', (c) => {
        const id = c.req.param('id')
        const author = AUTHORS[parseInt(id)]
        if (!author) return c.json('Not found', 404)
        return c.json(author)
    })

const books = new Hono()
    .get('/', (c) => c.json('list books'))
    .post('/', (c) => c.json('create a book', 201))
    .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

const routes = app.route('/authors', authors).route('/books', books)
export type AppType = typeof routes

/*
server listen
*/

const port = 3002
console.log(`Server is running on port ${port}`)

serve({
    fetch: routes.fetch,
    port,
})
