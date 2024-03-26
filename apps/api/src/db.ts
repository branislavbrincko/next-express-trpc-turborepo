type User = { id: number; name: string }

// Imaginary database
let users: User[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
]

export const db = {
    user: {
        findMany: async () => users,
        findById: async (id: number) => users.find((user) => user.id === id),
        create: async (data: { name: string }) => {
            const user = { id: users.length + 1, ...data }
            users.push(user)
            return user
        },
        deleteById: async (id: number) => {
            users = users.filter((user) => user.id !== id)
        },
    },
}
