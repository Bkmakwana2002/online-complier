const fs = require('fs')
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, "codes")

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true })
}

const generateFile = async (formate, code) => {

    const id = uuid();
    const fileName = `${id}.${formate}`

    const filePath = path.join(dirCodes, fileName)

    await fs.writeFileSync(filePath, code)
    return filePath

}

module.exports = {
    generateFile
}