import { useQuery } from '@tanstack/react-query'
import { AppType } from 'api-with-hono'
import { hc } from 'hono/client'
import { useState } from 'react'
import { trpc } from '../utils/trpc'

class NotFound extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'NotFound'
    }
}

const honoClient = hc<AppType>('http://localhost:3002/')

export default function Home() {
    const utils = trpc.useUtils()

    const [name, setName] = useState<string>('')
    const [order, setOrder] = useState<'asc' | 'desc'>('asc')
    const [authorId, setAuthorId] = useState<number>(1)

    /* 
    Queries
    */

    const { data: users, isLoading, isError } = trpc.userList.useQuery()

    const {
        isLoading: isLoadingAuthors,
        isError: isErrorAuthors,
        data: authors,
    } = useQuery({
        queryKey: ['authors', order],
        queryFn: async () => {
            const res = await honoClient.authors.$get({ query: { order } })
            //                                                    ^?
            if (!res.ok) throw new Error('Failed to fetch authors')
            return res.json()
        },
    })
    const { data: author, error } = useQuery({
        queryKey: ['author', authorId],
        queryFn: async () => {
            const res = await honoClient.authors[':id'].$get({ param: { id: `${authorId}` } })
            if (res.status === 404) throw new NotFound('Author not found')
            if (!res.ok) throw new Error('Failed to fetch author')
            return res.json()
        },
        enabled: Boolean(authorId),
        retry: false,
    })

    /* 
    Mutations
    */

    const createUser = trpc.createUser.useMutation({
        onSuccess() {
            setName('')
            utils.userList.invalidate()
        },
        onError(error) {
            console.log(error)
        },
    })
    const deleteUser = trpc.deleteUser.useMutation({
        onSuccess() {
            utils.userList.invalidate()
        },
        onError(error) {
            console.log(error)
        },
    })

    /* 
    Event handlers
    */

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        createUser.mutate({ name })
    }

    /* 
    Render
    */

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error</div>
    }

    return (
        <div>
            <h1>Welcome</h1>
            <h2>Users</h2>
            <ul>
                {users?.map((user, index) => (
                    <li key={index} style={{ display: 'flex', gap: 8 }}>
                        <div>
                            {user.name} (id: {user.id})
                        </div>
                        <button
                            onClick={() => {
                                deleteUser.mutate(user.id)
                            }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <h3>Add new user</h3>
            <form onSubmit={onSubmit}>
                <label htmlFor='name'>Name </label>
                <input type='text' name='name' id='name' value={name} onChange={onChange}></input>
                <button type='submit'>Submit</button>
            </form>
            <hr />

            {/* authors */}
            <h3>Authors</h3>
            <button onClick={() => setOrder('asc')}>Sort asc</button>
            <button onClick={() => setOrder('desc')}>Sort desc</button>
            {isLoadingAuthors && <div>Loading authors...</div>}
            {isErrorAuthors && <div>Error fetching authors</div>}
            <ul>{authors?.authors.map((author, index) => <li key={index}>{author}</li>)}</ul>
            <hr />

            {/* author */}
            <input type='number' value={authorId} onChange={(e) => setAuthorId(parseInt(e.target.value))} />
            <p>{author}</p>
            <p>{error instanceof NotFound && '404 - author not found'}</p>
        </div>
    )
}
