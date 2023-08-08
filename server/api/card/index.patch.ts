export default defineEventHandler(async event => {
    await batchPatch(event, 'card')
    return 200
})