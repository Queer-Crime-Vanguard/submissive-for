function insertType() {
    const types = storeGet('types')

    const percentage = new Map()

    Object.keys(types).filter(t => t.endsWith('_total')).forEach((t) => {
        const tname = t.substring(0, t.length-6)
        percentage.set(tname, 100*types[tname]/types[t])
    })

    const typesSort = new Map([...percentage.entries()].sort((a, b) => b[1] - a[1]));

    const type = typesSort.entries().next().value[0]

    const type_description = document.querySelector('.types #'+type)

    document.getElementById('type_holder').appendChild(type_description)
}