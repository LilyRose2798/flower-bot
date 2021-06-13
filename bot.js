const fs = require("fs")
const Discord = require("discord.js")
const client = new Discord.Client()
const { CronJob } = require("cron")
require("dotenv").config()

const colors = ["AQUA", "GREEN", "BLUE", "YELLOW", "PURPLE", "LUMINOUS_VIVID_PINK", "GOLD", "ORANGE", "RED", "NAVY", "DARK_AQUA", "DARK_GREEN", "DARK_BLUE", "DARK_PURPLE", "DARK_VIVID_PINK", "DARK_GOLD", "DARK_ORANGE", "DARK_RED"]
const flowers = JSON.parse(fs.readFileSync("flowers.json"))
let state = fs.existsSync("state.json") ? JSON.parse(fs.readFileSync("state.json")) : {flowerIndex: 0, colorIndex: 0, imageIndex: 0}

const randomArrayIndex = n => Math.floor(Math.random() * n.length)

const createEmbed = ({flowerIndex, imageIndex, colorIndex} = state, author = "Flower of the Day") => {
    const flower = flowers[flowerIndex]
    const flowerName = flower.flowerName
    const imageUrl = flower.images[imageIndex]
    const color = colors[colorIndex]
    const description = `**Kingdom:** ${flower.kingdom}\n**Phylum:** ${flower.phylum}\n**Class:** ${flower.class}\n**Order:** ${flower.order}\n**Family:** ${flower.family}\n**Genus:** ${flower.genus}\n\n**Lifespan:** ${flower.lifespans.join("/")}\n`
    return new Discord.MessageEmbed().setTitle(flowerName).setAuthor(author).setImage(imageUrl).setColor(color).setDescription(description)
}

let curEmbed = createEmbed()

const refreshFlower = async () => {
    state.flowerIndex = randomArrayIndex(flowers)
    state.imageIndex = randomArrayIndex(flowers[state.flowerIndex].images)
    state.colorIndex = randomArrayIndex(colors)
    curEmbed = createEmbed()
    client.guilds.cache.forEach(g => g.channels.cache.find(c =>
        /flower[-_]?of[-_]?the[-_]?day|fotd/i.test(c.name))?.send(curEmbed))
    fs.writeFileSync("state.json", JSON.stringify(state, null, 4))
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
    new CronJob("00 00 20 * * *", refreshFlower).start()
    // refreshFlower()
})

client.on("message", msg => {
    if (/^!fotd\s*$/.test(msg.content)) return msg.channel.send(curEmbed)
    const flowerMatch = msg.content.match(/^!flower(?:\s+(.+?)?)?\s*$/)
    if (!flowerMatch) return
    if (!flowerMatch[1]) return msg.channel.send(curEmbed)
    const flowerName = flowerMatch[1].toLowerCase()
    const flowerIndex = flowers.findIndex(x => x.flowerName.toLowerCase() === flowerName)
    if (flowerIndex === -1) return msg.channel.send(`Unable to find flower with the name ${flowerMatch[1]}.`)
    return msg.channel.send(createEmbed({
        flowerIndex: flowerIndex,
        imageIndex: randomArrayIndex(flowers[flowerIndex].images),
        colorIndex: randomArrayIndex(colors)
    }, "Flower Lookup"))
})

client.login(process.env.DISCORD_TOKEN)
