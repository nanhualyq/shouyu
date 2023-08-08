export default defineEventHandler(async event => {
    await batchPatch(event, 'sentence')
    return 200
})