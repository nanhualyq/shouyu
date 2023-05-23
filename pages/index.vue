<template>
    <p>
        status {{ status }}
    </p>
    <p>
        data {{ data }}
    </p>
    <p>{{ name }}</p>
</template>

<script setup>
const { status, data, signIn, signOut } = useAuth()
const { data: name } = await useLazyFetch('/api/user')
// status.value // Session status: `unauthenticated`, `loading`, `authenticated`
// data.value // Session data, e.g., expiration, user.email, ...

// await signIn() // Sign in the user
// await signOut() // Sign out the user
</script>