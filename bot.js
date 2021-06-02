const fs = require("fs")
const Discord = require("discord.js")
const client = new Discord.Client()
const { CronJob } = require("cron")
require("dotenv").config()

const colors = ["AQUA", "GREEN", "BLUE", "YELLOW", "PURPLE", "LUMINOUS_VIVID_PINK", "GOLD", "ORANGE", "RED", "NAVY", "DARK_AQUA", "DARK_GREEN", "DARK_BLUE", "DARK_PURPLE", "DARK_VIVID_PINK", "DARK_GOLD", "DARK_ORANGE", "DARK_RED"]
const flowers = JSON.parse(fs.readFileSync("flowers.json"))
let state = fs.existsSync("state.json") ? JSON.parse(fs.readFileSync("state.json")) : {flowerIndex: 0, colorIndex: 0, imageIndex: 0}

const randomArrayIndex = n => Math.floor(Math.random() * n.length)

const createEmbed = () => {
    const flower = flowers[state.flowerIndex]
    const flowerName = flower.flowerName
    const color = colors[state.colorIndex]
    const imageUrl = flower.images[state.imageIndex]
    const description = `**Kingdom:** ${flower.kingdom}\n**Phylum:** ${flower.phylum}\n**Class:** ${flower.class}\n**Order:** ${flower.order}\n**Family:** ${flower.family}\n**Genus:** ${flower.genus}\n\n**Lifespan:** ${flower.lifespans.join("/")}\n`
    return new Discord.MessageEmbed().setTitle(flowerName).setAuthor("Flower of the Day").setColor(color).setImage(imageUrl).setDescription(description)
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
    if (msg.content === "!fotd")
        msg.channel.send(curEmbed)
})

client.login(process.env.DISCORD_TOKEN)
