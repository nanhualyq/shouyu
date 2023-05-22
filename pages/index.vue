<template>
    <p>
        status {{ status }}
    </p>
    <p>
        data {{ data }}
    </p>
</template>

<script setup>
// definePageMeta({ middleware: 'auth' })
// file: e.g ~/pages/login.vue
const { status, data, signIn, signOut } = useAuth()

// status.value // Session status: `unauthenticated`, `loading`, `authenticated`
// data.value // Session data, e.g., expiration, user.email, ...

// await signIn() // Sign in the user
// await signOut() // Sign out the user
</script>