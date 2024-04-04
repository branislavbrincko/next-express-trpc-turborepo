import { useState } from 'react'
import { trpc } from '../utils/trpc'

export default function Home() {
    const utils = trpc.useUtils()

    const [name, setName] = useState<string>('')

    /* 
    Queries
    */

    const { data: users, isLoading, isError } = trpc.userList.useQuery()

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
        </div>
    )
}
