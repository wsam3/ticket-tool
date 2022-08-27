const Discord = require('discord.js')
const db = require('quick.db')
const client = new Discord.Client({intents:[Discord.Intents.FLAGS.GUILDS,Discord.Intents.FLAGS.GUILD_MESSAGES]})
const {token , prefix} = require('./in.json')
const axios = require(`axios`)
const ex = require('express')
const app = ex()
app.get('/',(req,res)=>{
res.send(`Hi `)
})
app.listen(3422)
client.on('messageCreate',message=>{
  if(message.content.toLowerCase().startsWith(prefix+"help")){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    const args = message.content.split(" ").slice(1).join(" ")
    let array = ["commands","setup","faq"]
    const embed = new Discord.MessageEmbed()
    .addField(`Help Options`,`\`${prefix}help commands\` - Information on commands\n\`${prefix}help faq\` - Frequently asked questions`)
    if(!array.includes(args)||!args)return message.channel.send({embeds:[embed]})
    if(args == "commands"){
      const commands = new Discord.MessageEmbed()
      .addFields({name:`\`$add [User] (channel)\``,value:`Description: Adding additional\nusers to a ticket\nAliases: none`},
                 {name:`\`$remove [User] (channel)\``,value:`Description: Removing users\nfrom a ticket\nAliases: none`},
                 {name:`\`$close\``,value:`Description: Closing tickets\nAliases: none`},
                 {name:`\`$open\``,value:`Description: Opening closed tickets\nAliases: none`},
                 {name:`\`$delete\``,value:`Description: Deleting tickets\nAliases: none`},
                 {name:`\`$rename\``,value:`Description: Renaming tickets/channels\nAliases: none`},
                 {name:`\`$transcript (send channel)\``,value:`Description: Creating transcripts\nAliases: none`},
                 {name:`\`$new (user) (reason)\``,value:`Description: Creating tickets in a monitored channel (when command style is enabled)\nAliases: none`},
                 {name:`\`$claim\``,value:`Description: Claiming tickets (when claim is enabled)\nAliases: "unclaim"`},
                 {name:`\`$help (Help Options)\``,value:`Description: Help Command\nAliases: none`},
                 {name:`\`$debug\``,value:`Description: Debuging issues with running Ticket Tool\nAliases: none`},
                 {name:`\`$id (@role/@user/#channel/emoji)\``,value:`Description: Converting roles, users, channels and emojis to ID\mAliases: "getid"`},
                 {name:`\`$permlevel\``,value:`Description: Checking permission level with Ticket Tool\nAliases: "level"`},
                 {name:`\`$ping\``,value:`Description: Checking response time with discord api\nAliases: none`},
                 {name:`\`$vote (link | unlink | redeem) (user)\``,value:`Description: Earn premium by voting on top.gg or Discord.boats\nAliases: "votes"`},
                 
                )
      message.channel.send({embeds:[commands]})
    }
    if(args == "faq"){
      const faq = new Discord.MessageEmbed()
      .addFields({name:`======FAQ======`,value:`If a question interests you run the command to see the answer.`},
                 {name:`**Q: What is the prefix and how do I change it?**`,value:`A: \`$help prefix\``},
                 {name:`**Q: How do I make a ticket ping my support when it's created?**`,value:`A:\`$help ping\``},
                 {name:`**Q: How do I set a transcript channel?**`,value:`A:\` $help transcript\``},
                 {name:`**Q: How do I limit the number of tickets a user can create?**`,value:`A:\`$help limit\``},
                 {name:`**Q: How do I set what category tickets are created in?**`,value:`A:\`$help category\``},
                 {name:`**Q: How do I set what category tickets are moved to when closed?**`,value:`A:\`$help closed\``},
                 {name:`**Q: How do I set a custom reaction?**`,value:`A:\`$help reaction\``},
                 {name:`**Q: How do I set the permissions for the tickets?**`,value:`A:\`$help perms\``},
                 {name:`**Q: How do I create a panel?**`,value:`A:\`$help panel\``},
                 {name:`**Q: How do I get the panel in my discord?**`,value:`A:\`$help send\``},
                 {name:`**Q: How do I add or remove users from a ticket?**`,value:`A:\`$help add\``},
                 {name:`**Q: Ticket Tool isn't responding to my commands, How do I fix it?**`,value:`A:\`$help offline\``},
                 {name:`**Q: How does the claim command work?**`,value:`A:\`$help claim\``},
                 
                )
      message.channel.send({embeds:[faq]})
    }
  }
  
  if(message.content.toLowerCase().startsWith(prefix+'add')){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    const ticket = db.get(`ticket_${message.channel.id}`)
    if(!ticket)return message.channel.send(`Channel is not a ticket`)
    const user = message.mentions.members.first();
    if(!user)return message.channel.send(`Missing required option: [User/Role] (optional channel)`)
    const channel = message.mentions.channels.first();
    if(!channel){
      message.channel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: true , SEND_MESSAGES:true });
      const embed = new Discord.MessageEmbed()
      .setDescription(`${user} added to ticket ${message.channel}`)
      message.channel.send({embeds:[embed]})
    }else{
      channel.permissionOverwrites.edit(user.id, {VIEW_CHANNEL: true , SEND_MESSAGES:true });
      const embed = new Discord.MessageEmbed()
      .setDescription(`${user} added to ticket ${channel}`)
      message.channel.send({embeds:[embed]})
    }
  }
  if(message.content.toLowerCase().startsWith(prefix+"remove")){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    const ticket = db.get(`ticket_${message.channel.id}`)
    if(!ticket)return message.channel.send(`Channel is not a ticket`)

    const user = message.mentions.members.first();
    if(!user)return message.channel.send(`Missing required option: [User/Role] (optional channel)`)

    const channel = message.mentions.channels.first();
    if(!channel){
      message.channel.permissionOverwrites.delete(user.id);
      const embed = new Discord.MessageEmbed()
      .setDescription(`${user} removed from ticket ${message.channel}`)
      message.channel.send({embeds:[embed]})
    }else{
      channel.permissionOverwrites.delete(user.id);
      const embed = new Discord.MessageEmbed()
      .setDescription(`${user} removed from ticket ${channel}`)
      message.channel.send({embeds:[embed]})
    }
  }
  if(message.content.toLowerCase().startsWith(prefix+"close")){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    const ticket = db.get(`ticket_${message.channel.id}`)
    if(!ticket)return message.channel.send(`> **Warning**: This channel isn't a ticket
`)
    let ii = 0
    message.channel.setName(`closed-${ticket||++ii}`)
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket Closed by ${message.author}`);
    const two = new Discord.MessageEmbed()
    .setDescription(`\`\`\`Support team ticket controls\`\`\``)
    const raw =new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('delete')
                    .setLabel('Delete')
                    .setStyle('SECONDARY')
                    .setEmoji(`⛔`),
              new Discord.MessageButton()
                    .setCustomId('open')
                    .setLabel('open')
                    .setStyle('SECONDARY')
                    .setEmoji(`🔓`),
              new Discord.MessageButton()
                    .setCustomId('trans')
                    .setLabel('Transcript')
                    .setStyle('SECONDARY')
                    .setEmoji(`📑`),
            );
    let s = message.channel.send({embeds:[embed,two],components:[raw]})
    const collector = message.channel.createMessageComponentCollector();

collector.on('collect', async i => {
	if(i.customId == "delete"){
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket will be deleted in a few seconds`)
    message.channel.send({embeds:[embed]}).then(
      setTimeout(()=>{
        message.channel.delete()
      },5000)
    )
    await s.then(msg=>{msg.delete()})
    collector.stop()
  }
  if(i.customId == "open"){
    message.channel.setName(`ticket-${ticket||++ii}`)
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket Opened by ${i.user}`)
    message.channel.send({embeds:[embed]})
    // i.update
    await s.then(msg=>{msg.delete()})
    collector.stop()
  }
  if(i.customId == "trans"){
    let array = []
    let owner = db.get(`owner_${message.channel.id}`)
    let panel = db.get(`panel_${message.channel.id}`)
    let t1 = new Discord.MessageEmbed()
    .setDescription(`Transcript saved to ${message.channel}`)
    message.channel.send({embeds:[t1]})
    const t2 = new Discord.MessageEmbed()
    .addFields({name:`Ticket Owner`,value:`${owner}`,inline:true},
              {name:`Ticket Name`,value:`${message.channel.name}`,inline:true},
              {name:`Panel Name`,value:`${panel}`,inline:true},
              {name:`Users in transcript`,value:`${message.channel.messages.cache.map(u=>`${u.author.username} - ${u.author.tag}`)}`,inline:true})
    message.channel.send({content:`\`\`\`html\n<Server-Info>\n    Server: ${message.guild.name} (${message.guild.id})\n    Channel : ${message.channel.name} (${message.channel.id})\n    Messages : ${message.channel.messages.cache.size}\n<User-Info>\n    ${message.channel.messages.cache.map(u=>`${u.author.tag} (${u.author.id})`).join('\n    ')}\`\`\``,embeds:[t2]})
    await s.then(msg=>{msg.delete()})
    collector.stop()
  }
});
  }

  if(message.content.toLowerCase().startsWith(prefix+"open")){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    let ii= 0
    const ticket = db.get(`last_ticket${message.guild.id}`)
    if(!ticket)return message.channel.send(`> **Warning**: This channel isn't a ticket`)
    message.channel.setName(`ticket-${ticket||++ii}`)
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket Opened by ${message.author}`)
    message.channel.send({embeds:[embed]})
  }
  if(message.content.toLowerCase() == prefix+"delete"){
    const ticket = db.get(`ticket_${message.channel.id}`)
    if(!ticket)return message.channel.send(`> **Warning**: This channel isn't a ticket`)
    message.delete()
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket will be deleted in a few seconds`)
    message.channel.send({embeds:[embed]}).then(
      setTimeout(()=>{
        message.channel.delete()
      },5000)
    )
  } 
  if(message.content.toLowerCase().startsWith(prefix+"rename")){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    const ticket = db.get(`ticket_${message.channel.id}`)
    if(!ticket)return message.channel.send(`> **Warning**: This channel isn't a ticket`)
    const name = message.content.split(" ").slice(1).join(" ")
    if(!name){
      message.delete()
      return message.channel.send(`> **Warning**: Missing required option: [New channel name]`)
    }
    message.delete()
    message.channel.setName(name)
  }
  if(message.content.toLowerCase() == prefix+"debug"){
    let e = message.guild.roles.cache.find(r=>r.name=="@everyone")
    const embed = new Discord.MessageEmbed()
    .addFields({name:`Bot Permissions`,value:`✅ - Read Channels\n✅ - Send Messages\n✅ - Embed Links\n✅ - Attach Files\n✅ - Manage Roles\n✅ - Manage Channels\n✅ - Manage Messages\n✅ - Read History`,inline:true},
               {name:`Channel Permissions`,value:`✅ - Read Channels\n✅ - Send Messages\n✅ - Embed Links\n✅ - Attach Files\n✅ - Manage Roles\n✅ - Manage Channels\n✅ - Manage Messages\n✅ - Read History`,inline:true},
               {name:`Server Information`,value:`Channel name:\n\`${message.channel.name}\`\nChannel ID:\n\`${message.channel.id}\`\nChannel Count:\n\`${message.guild.channels.cache.size}/500\`\nServer name:\n\`${message.guild.name}\`\nServer ID:\n\`${message.guild.id}\``,inline:true},
               {name:`User Information`,value:`User name:\n\`${message.author.tag}\`\nUser ID:\n\`${message.author.id}\``,inline:true},
               {name:`Bot Information`,value:`Prefix:\n\`${prefix}\`\nPremium Status:\n\`Free - []\`\nCurrent shard:\n\`${client.ws.shards.map(s=>s.id)}\`\nAPI Latency:\n\`${client.ws.ping}\``,inline:true}
              )
    message.channel.send({content:`If Ticket Tool support requested this debug give them this link:
https://discordapp.com/channels/509192800865353738/662692902245498910/1010188543051706369`,embeds:[embed]})
  }
  if(message.content.toLowerCase()==prefix+"ping"){
    
    message.channel.send(`Ping ?`).then(msg=>{
      msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms [-] `)
    })
  }
  if(message.content.toLowerCase().startsWith(prefix+"ticket")){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    if(db.get(`col_${message.channel.id}`))return message.reply(`You Did Make A Ticket Test an Other Channel or Write \`${prefix}stop\`\n(${db.get(`col_${message.channel.id}`)})`)
    
    const collector = message.channel.createMessageComponentCollector();
    let desc = message.content.split("desc : ")
    let msg = message.content.split("message : ")
    const embed =new Discord.MessageEmbed()
    .setDescription(`${desc[1]||`To create a ticket react with 📩`}`);
    const raw =new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('tick')
                    .setLabel('Create Ticket')
                    .setStyle('SECONDARY')
                    .setEmoji(`📩`),
            );
    
    collector.on('collect', async i => {
      if(i.customId == "tick"){
        
        let eee = i.reply({content:`Creating Ticket ...`, ephemeral: true,})
        db.add(`last_ticket${message.guild.id}`,1)
      i.guild.channels.create(`Ticket-${db.get(`last_ticket${message.guild.id}`)||1}`,{type:'GUILD_TEXT',}).then(ch=>{
        ch.permissionOverwrites.set([
	{
		id: message.guild.id,
		deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
	},
	{
		id: i.member.user.id,
		allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL ,Discord.Permissions.FLAGS.SEND_MESSAGES],
	},
]);
        eee.then(e=>i.editReply(`Ticket created ${ch}`))
        db.set(`ticket_${ch.id}`,db.get(`last_ticket${message.guild.id}`))
        const em = new Discord.MessageEmbed()
        .setDescription(`Support will be with you shortly.
To close this ticket react with 🔒`);
        const r =new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('clo')
                    .setLabel('Close')
                    .setStyle('SECONDARY')
                    .setEmoji(`🔒`),
            );
        const collector = ch.createMessageComponentCollector();
        ch.send({content:`${i.member} , ${msg[1]||`Welcome`}`,embeds:[em],components:[r]})
        collector.on('collect',async ii=>{
          if(ii.customId =="clo"){
            const ticket = db.get(`ticket_${ii.channel.id}`)
    if(!ticket)return ii.channel.send(`> **Warning**: This channel isn't a ticket
`)
    let iii = 0
    ii.channel.setName(`closed-${db.get(`ticket_${ii.channel.id}`)||++iii}`)
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket Closed by ${ii.member}`);
    const two = new Discord.MessageEmbed()
    .setDescription(`\`\`\`Support team ticket controls\`\`\``)
    const raw =new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('delete')
                    .setLabel('Delete')
                    .setStyle('SECONDARY')
                    .setEmoji(`⛔`),
              new Discord.MessageButton()
                    .setCustomId('open')
                    .setLabel('open')
                    .setStyle('SECONDARY')
                    .setEmoji(`🔓`),
              new Discord.MessageButton()
                    .setCustomId('trans')
                    .setLabel('Transcript')
                    .setStyle('SECONDARY')
                    .setEmoji(`📑`),
            );
    let s = ii.channel.send({embeds:[embed,two],components:[raw]})
    const collector = ii.channel.createMessageComponentCollector();

collector.on('collect', async i => {
	if(i.customId == "delete"){
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket will be deleted in a few seconds`)
    ii.channel.send({embeds:[embed]}).then(()=>{
      setTimeout(()=>{
        i.channel.delete()
      },5000)

    })
    await s.then(msg=>{msg.delete()})
    collector.stop()
  }
  if(i.customId == "open"){
    ii.channel.setName(`ticket-${ticket||++ii}`)
    const embed = new Discord.MessageEmbed()
    .setDescription(`Ticket Opened by ${i.user}`)
    ii.channel.send({embeds:[embed]})
    // i.update
    await s.then(msg=>{msg.delete()})
    collector.stop()
  }
  if(i.customId == "trans"){
    let owner = db.get(`owner_${ii.channel.id}`)
    let panel = db.get(`panel_${ii.channel.id}`)
    let t1 = new Discord.MessageEmbed()
    .setDescription(`Transcript saved to ${ii.channel}`)
    ii.channel.send({embeds:[t1]})
    const t2 = new Discord.MessageEmbed()
    .addFields({name:`Ticket Owner`,value:`${owner}`,inline:true},
              {name:`Ticket Name`,value:`${ii.channel.name}`,inline:true},
              {name:`Panel Name`,value:`${panel}`,inline:true},
              {name:`Users in transcript`,value:`${ii.channel.messages.cache.map(u=>`${u.author.username} - ${u.author.tag}`)}`,inline:true})
    ii.channel.send({content:`\`\`\`html\n<Server-Info>\n    Server: ${ii.guild.name} (${ii.guild.id})\n    Channel : ${ii.channel.name} (${ii.channel.id})\n    Messages : ${ii.channel.messages.cache.size}\n<User-Info>\n    ${ii.channel.messages.cache.map(u=>`${u.author.tag} (${u.author.id})`).join('\n    ')}\`\`\``,embeds:[t2]})
    await s.then(msg=>{msg.delete()})
    collector.stop()
  }
});
      
          }
        })
      })
      }
      
    })
    message.channel.send({embeds:[embed],components:[raw]}).then(msg=>{
      db.set(`col_${message.channel.id}`,msg.url)
    })
  }
  if(message.content.toLowerCase()==prefix+"stop"){
    if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))return ;
    const collector = message.channel.createMessageComponentCollector();
    collector.dispose(message)
    db.delete(`col_${message.channel.id}`)
  }
  if(message.content.toLowerCase() == prefix+"reloaddata"){
    if(message.author.id !== message.guild.ownerId)return message.channel.send(`:x: This Commands For Server Owner Only `)
    const fs = require('fs')

const path = './json.sqlite'

fs.unlink(path, (err) => {
  if (err) {
    message.channel.send(`:x: Error `)
    return
  }

})
    message.channel.send(`Data Reloaded Succefuly `)
  }
})
process.on("unhandledrejection",err=>{
  return ;
})

client.login(token)
