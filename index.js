const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");



client.on("ready",()=>{
    console.log("Online!");
    client.user.setActivity('!ticket abuabu niin saat apua', { type: 'STREAMING' });
});

client.on("message",async message=>{
    if(message.author.bot||message.type=="dm")return;
    var arg = message.content.toLowerCase().split(" ");
    if(arg[0]!='!ticket')return;
    if(!message.guild.me.hasPermission("MANAGE_CHANNELS")||!message.guild.me.hasPermission("MANAGE_ROLES")){
        message.channel.send("Ei tarpeeki oikeuksia! Tarvitsen kanavien ja roolien hallinta oikeudet!")
        message.delete({ timeout: 10000 })
        return;
    }
    let TicketCategory = message.guild.channels.find(channel=>channel.name==="Avatut ticketit");
    if(TicketCategory==null){
        await message.guild.createChannel('Avatut ticketit', {
            type: 'category',
            permissionOverwrites: [{
              id: message.guild.id,
              deny: ['READ_MESSAGES']
            }]
          })
          .then(t=>TicketCategory=t)
          .catch(console.error);
    }
    switch (arg[1]) {
        case "luo":
            if(arg.length<=2){
                message.reply("Käytä komentoa `!ticket luo (syy)`");
                return;
            }
            let syy = arg.slice(2).join(" ");
            // syy\n\n**"+syy+"**";
            syy = new Discord.RichEmbed()
            .setTitle("Käyttäjä "+message.author.username+" avasi ticketin!")
            .setDescription(syy)
            .setFooter("Selvitä mahdollisimman nopeasti!")
            .setColor('#32cd32');
            if(syy.length>=1800){
                message.reply("Kerro ongelmasi lyhyemmin!")
                message.delete({ timeout: 10000 })
                return;
            }
            let roles = message.guild.roles.filter(x=>x.hasPermission("MANAGE_CHANNELS"));
            let perms=[];
            roles.forEach(role => {
               perms.push( 
                    {
                        id:role.id,
                        allow:["READ_MESSAGES"]
                    }
                )
              });
              perms.push(
                    {
                        id:message.guild.id,
                        deny: ["READ_MESSAGES"]
                    },
                    {
                        id: message.author.id,
                        allow:["READ_MESSAGES"]
                    }
              );
            message.guild.createChannel(message.author.username+" ticketti",{
                type:"text",
                parent:TicketCategory.id,
                permissionOverwrites:perms
            }).then(channel=>channel.send(syy))
            break;
        case "poista":
            if(!message.channel.name.endsWith("ticketti")){
                message.reply("Kirjoita tämä avoinna olevaan tickettiin!!!");
                break;
            }
            message.reply("Haluatko varmasti poistaa tämän ticketin?\nKirjoita `!ticket vahvista` poistaaksesi.");
            
            const collector = message.channel.createMessageCollector(
                m=>m.content.toLowerCase().startsWith("!ticket vahvista")&&m.author.id==message.author.id,
                {time:20000,max:1}
            );
            collector.on('collect', m => {
                if(!m.channel.deletable)message.reply("404 en voi poistaa kanavaa");
                else m.channel.delete();
              });
            break;
        case "abuabu":
            var help = new Discord.RichEmbed()
                .setTitle("Terve "+message.author.username+"!")
                .setDescription("Miten luon ticketin? Käytä allaolevia komentoja millä tahansa kanavalla!.")
                .addField("!ticket luo <syy>","Avaa ticketti niin ratkaistaan ongelmasi!")
                .addField("!ticket poista","Poista ticketti tällä komennolla!")
                .setColor('#32cd32');
            message.author.send(help);
            message.delete({ timeout: 10000 })
            break;
    }
});

client.login(config.token);
