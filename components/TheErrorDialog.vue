<template>
    <!-- Open the modal using ID.showModal() method -->
    <!-- <button class="btn" onclick="the_error_dialog.showModal()">open modal</button> -->
    <dialog id="the_error_dialog" class="modal">
        <form method="dialog" class="modal-box bg-error">
            <h3 class="font-bold text-lg text-error-content">Error!</h3>
            <p class="py-4 text-error-content">{{ message }}</p>
            <div class="modal-action">
                <!-- if there is a button in form, it will close the modal -->
                <button class="btn btn-block btn-outline">Close</button>
            </div>
        </form>
    </dialog>
</template>

<script setup>
const message = useState('TheErrorDialogMessage', () => ref(''))
</script>