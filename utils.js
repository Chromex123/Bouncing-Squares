function collision({object1, object2}) {
    return (
    object1.position.y + object1.dimensions.y >= object2.position.y &&
    object1.position.y <= object2.position.y + object2.dimensions.y &&
    object1.position.x <= object2.position.x + object2.dimensions.x &&
    object1.position.x + object1.dimensions.x >= object2.position.x
    )
}

// The maximum is inclusive and the minimum is inclusive
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

