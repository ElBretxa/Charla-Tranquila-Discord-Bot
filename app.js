const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');
const { Permissions } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const tokenToStart = ""; // ENTER THE BOT TOKEN
const voiceChannelID = ""; // ENTER THE CHANNEL THE USER HAS TO JOIN TO CREATE A VOICE CHAT
const categoryId = ""; // CATEGORY YOU WANT THE VOICE CHATS TO BE CREATED IN (VOICE CHANNELS INHERIT THE CATEGORY PERMS)

const client = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMembers, 
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Discord.Partials.Message, Discord.Partials.Channel, Discord.Partials.Reaction],
})

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    if (!message.content.startsWith('!')) return;

    const member = message.member;
    const channelName = message.channel.name;
    const channelID = message.channel.name;

    const match = channelName.match(/^☕ Charla (\d+) Tranquila$/);

    if (match && parseInt(match[1]) > 0) {
      
      if (member && member.voice.channel) {
        const vcChannel = member.voice
        console.log(`User is in voice channel: ${vcChannel.channel.name}`);

        const matchedChannelInfo = channelInfo.find(info => info[1] === vcChannel.channel.id);

        if (matchedChannelInfo){
          if (matchedChannelInfo[2] == member.id){

            // ------------------------------------------ VOICE COMMANDS ----------------------------------------------------- //

            if (message.content.startsWith('!voice-limit')) {
              
              parts = message.content.split(" ")
              
              if (parts.length > 1) {
                const data = parts[1];
                const number = parseInt(data);

                if (!isNaN(number) && number >= 1 && number <= 10) {
                    console.log("YES");

                    const userLimit = number;

                    vcChannel.channel.edit({ userLimit: userLimit })
                        .then(updatedChannel => {
                          console.log(`User limit set to ${updatedChannel.userLimit} in ${updatedChannel.name}`)

                          const embed = new EmbedBuilder()
                            .setColor('#0099ff') 
                            .setDescription(`<@${member.id}>, has cambiado el límite de usuarios de este canal de voz temporal a ${number}.`) 

                          message.channel.send({ 
                            embeds: [embed]
                          });

                        })
                        .catch(console.error);
                } else {
                    console.log("NO");
                }
            }
            }

            if (message.content.startsWith('!voice-transfer')) {

              if (message.mentions.users.size > 0) {
                const firstMentionedUser = message.mentions.users.first();
        
                console.log(`First mentioned user: ${firstMentionedUser.username}`);

                if (firstMentionedUser.id == message.member.id) {
                  const embed = new EmbedBuilder()
                    .setColor('#0099ff') 
                    .setDescription(`<@${member.id}>, ya eres el dueño del canal.`)

                  message.channel.send({ 
                    embeds: [embed]
                  });

                  return
                }

                const vcChannel = member.voice
                if (vcChannel) {
                    const mentionedMember = await message.guild.members.fetch(firstMentionedUser.id);
                    const memberWhoSentMsg = await message.guild.members.fetch(message.author.id);

                    if (mentionedMember.voice.channel) {
                      if (mentionedMember.voice.channel.id === memberWhoSentMsg.voice.channel.id) {
                        const matchedChannelInfo = channelInfo.filter(info => info[2] === mentionedMember.id);

                        if (matchedChannelInfo.length > 0) {
                          const embed = new EmbedBuilder()
                            .setColor('#0099ff') 
                            .setDescription(`<@${member.id}>, ya es propietario de un canal de voz temporal del mismo Hub.`)

                          message.channel.send({ 
                            embeds: [embed]
                          });
                        } else {
                            console.log("No channels are associated with the mentioned member.  ");
                            const matchedChannelInfo = channelInfo.find(info => info[1] === vcChannel.channel.id);
                            matchedChannelInfo[2] = mentionedMember.id

                            const embed = new EmbedBuilder()
                              .setColor('#0099ff') 
                              .setDescription(`<@${member.id}>, has transferido la propiedad de este canal de voz temporal a <@${mentionedMember.id}>.`)

                            message.channel.send({ 
                              embeds: [embed]
                            });

                            vcChannel.channel.permissionOverwrites.edit(message.author.id, {
                              MoveMembers: false
                            }).then(() => {
                                console.log(`Permissions updated for ${newState.member.displayName}`);
                            }).catch(console.error);


                        }
                        
                      } else {
                          console.log(`${mentionedMember.user.username} is not in the same voice channel.`);
                      }
                    } else {
                        console.log("One of the members is not in a voice channel.");
                    }
                } else {
                    console.log("You are not in a voice channel.");
                }

              } else {
                  console.log("No users were mentioned in the message.");
              }
            }

            if (message.content.startsWith('!voice-kick')) {

              if (message.mentions.users.size > 0) {
                const firstMentionedUser = message.mentions.users.first();
        
                console.log(`First mentioned user: ${firstMentionedUser.username}`);

                if (firstMentionedUser.id == message.member.id) {
                  const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${member.id}>, no te puedes kickear a ti mismo del canal de voz.`)

                  message.channel.send({ 
                    embeds: [embed]
                  });

                  return
                }

                const vcChannel = member.voice
                if (vcChannel) {
                  console.log(`Permissions updated to deny ${firstMentionedUser.username} from viewing ${vcChannel.name}`);

                  const mentionedMember = await message.guild.members.fetch(firstMentionedUser.id);
                  const memberWhoSentMsg = await message.guild.members.fetch(message.author.id);

                  if (mentionedMember.voice.channel) {
                    if (mentionedMember.voice.channel.id === memberWhoSentMsg.voice.channel.id) {
                        mentionedMember.voice.setChannel(null)
                            .then(() => {
                              console.log(`${mentionedMember.user.username} has been disconnected from the voice channel.`)
                              const embed = new EmbedBuilder()
                                .setColor('#0099ff')
                                .setDescription(`<@${member.id}>, has kickeado a <@${firstMentionedUser.id}> de este canal de voz temporal.`)

                              message.channel.send({ 
                                embeds: [embed]
                              });
                            })
                            .catch(console.error);
                    } else {
                      const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setDescription(`<@${member.id}>, <@${firstMentionedUser.id}> no esta en el canal de voz`)
    
                      message.channel.send({ 
                        embeds: [embed]
                      });
                    }
                  } else {
                      console.log("One of the members is not in a voice channel.");
                  }

                } else {
                    console.log("You are not in a voice channel.");
                }

              } else {
                  console.log("No users were mentioned in the message.");
              }
            }

            if (message.content.startsWith('!voice-ban')) {

              if (message.mentions.users.size > 0) {
                
                const firstMentionedUser = message.mentions.users.first();
        
                console.log(`First mentioned user: ${firstMentionedUser.username}`);

                if (firstMentionedUser.id == message.member.id) {
                  const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${member.id}>, no te puedes banear a ti mismo del canal de voz.`)

                  message.channel.send({ 
                    embeds: [embed]
                  });

                  return
                }

                const vcChannel = member.voice
                if (vcChannel) {
                  vcChannel.channel.permissionOverwrites.edit(firstMentionedUser, {
                      Connect: false
                  })
                  .then(async () => {
                      console.log(`Permissions updated to deny ${firstMentionedUser.username} from viewing ${vcChannel.name}`);

                      const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setDescription(`<@${member.id}>, has bloqueado a <@${firstMentionedUser.id}> de este canal de voz temporal.`)
                      
                      message.channel.send({ 
                        embeds: [embed]
                      });

                      const mentionedMember = await message.guild.members.fetch(firstMentionedUser.id);
                      const memberWhoSentMsg = await message.guild.members.fetch(message.author.id);

                      if (mentionedMember.voice.channel) {
                        if (mentionedMember.voice.channel.id === memberWhoSentMsg.voice.channel.id) {
                            mentionedMember.voice.setChannel(null)
                                .then(() => console.log(`${mentionedMember.user.username} has been disconnected from the voice channel.`))
                                .catch(console.error);
                        } else {
                            console.log(`${mentionedMember.user.username} is not in the same voice channel.`);
                        }
                    } else {
                        console.log("One of the members is not in a voice channel.");
                    }

                  })
                  .catch(console.error);
                } else {
                    console.log("You are not in a voice channel.");
                }

              } else {
                  console.log("No users were mentioned in the message.");
              }
            }

            if (message.content.startsWith('!voice-unban')) {

              if (message.mentions.users.size > 0) {
                const firstMentionedUser = message.mentions.users.first();
        
                console.log(`First mentioned user: ${firstMentionedUser.username}`);
                const vcChannel = member.voice
                if (vcChannel) {
                  vcChannel.channel.permissionOverwrites.edit(firstMentionedUser, {
                      Connect: true
                  })
                  .then(() => {
                      console.log(`Permissions updated to allow ${firstMentionedUser.username} from viewing ${vcChannel.name}`);
                      const embed = new EmbedBuilder()
                        .setColor('#0099ff') 
                        .setDescription(`<@${member.id}>, has desbloqueado a <@${firstMentionedUser.id}> en este canal de voz temporal.`)

                      message.channel.send({ 
                        embeds: [embed]
                      });
                  })
                  .catch(console.error);
                } else {
                    console.log("You are not in a voice channel.");
                }

              } else {
                  console.log("No users were mentioned in the message.");
              }
            }

            if (message.content.startsWith('!voice-lock')) {

              const everyoneRoleId = message.guild.roles.everyone.id;
              const vcChannel = member.voice
              if (vcChannel) {
                // Set permissions to deny the mentioned user from viewing the channel
                vcChannel.channel.permissionOverwrites.edit(everyoneRoleId, {
                    Connect: false,
                })
                vcChannel.channel.permissionOverwrites.edit(message.member, {
                  Connect: true,
                })
                .then(() => {
                  const embed = new EmbedBuilder()
                    .setColor('#0099ff') // Set the color of the embed
                    .setDescription(`<@${member.id}>, el canal ha sido bloqueado correctamente.`) // Set the description

                  // Send the embed with the image attachment
                  message.channel.send({ 
                    embeds: [embed]
                  });
                })
              }
            }

            if (message.content.startsWith('!voice-unlock')) {

              const everyoneRoleId = message.guild.roles.everyone.id;
              const vcChannel = member.voice
              if (vcChannel) {
                // Set permissions to deny the mentioned user from viewing the channel
                vcChannel.channel.permissionOverwrites.edit(everyoneRoleId, {
                  Connect: true,
                })
                .then(() => {
                  const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${member.id}>, el canal ha sido desbloqueado correctamente.`)

                  message.channel.send({ 
                    embeds: [embed]
                  });
                })
              }
            }

            if (message.content.startsWith('!voice-hide')) {

              if (message.mentions.users.size > 0) {
                const firstMentionedUser = message.mentions.users.first();
        
                console.log(`First mentioned user: ${firstMentionedUser.username}`);
                if (firstMentionedUser.id == message.member.id) {
                  const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${member.id}>, no te puedes ocultar a ti mismo el canal de voz.`)

                  message.channel.send({ 
                    embeds: [embed]
                  });

                  return
                }
                const everyoneRoleId = message.guild.roles.everyone.id;
                const vcChannel = member.voice
                if (vcChannel) {
                  vcChannel.channel.permissionOverwrites.edit(firstMentionedUser, {
                      Connect: false,
                      ViewChannel: false,
                  })
                  .then(() => {
                    const embed = new EmbedBuilder()
                      .setColor('#0099ff')
                      .setDescription(`<@${member.id}>, el canal ha sido ocultado de <@${firstMentionedUser.id}> correctamente.`)

                    message.channel.send({ 
                      embeds: [embed]
                    });
                  })
                }
              }else{
                const everyoneRoleId = message.guild.roles.everyone.id;
                const vcChannel = member.voice
                if (vcChannel) {
                  // Set permissions to deny the mentioned user from viewing the channel
                  vcChannel.channel.permissionOverwrites.edit(everyoneRoleId, {
                      Connect: false,
                      ViewChannel: false,
                  })
                  vcChannel.channel.permissionOverwrites.edit(message.member, {
                    Connect: true,
                    ViewChannel: true,
                  })
                  .then(() => {
                    const embed = new EmbedBuilder()
                      .setColor('#0099ff')
                      .setDescription(`<@${member.id}>, el canal ha sido ocultado correctamente.`)

                    message.channel.send({ 
                      embeds: [embed]
                    });
                  })
                }
              }
              
            }

            if (message.content.startsWith('!voice-reveal')) {

              if (message.mentions.users.size > 0) {
                const firstMentionedUser = message.mentions.users.first();
        
                console.log(`First mentioned user: ${firstMentionedUser.username}`);
                const everyoneRoleId = message.guild.roles.everyone.id;
                const vcChannel = member.voice
                if (vcChannel) {
                  // Set permissions to deny the mentioned user from viewing the channel
                  vcChannel.channel.permissionOverwrites.edit(firstMentionedUser, {
                      Connect: true,
                      ViewChannel: true,
                  })
                  .then(() => {
                    const embed = new EmbedBuilder()
                      .setColor('#0099ff')
                      .setDescription(`<@${member.id}>, el canal ha sido revelado a <@${firstMentionedUser.id}> correctamente.`)

                    message.channel.send({ 
                      embeds: [embed]
                    });
                  })
                }
              }else{
                const everyoneRoleId = message.guild.roles.everyone.id;
                const vcChannel = member.voice
                if (vcChannel) {
                  // Set permissions to deny the mentioned user from viewing the channel
                  vcChannel.channel.permissionOverwrites.edit(everyoneRoleId, {
                      Connect: true,
                      ViewChannel: true,
                  })
                  .then(() => {
                    const embed = new EmbedBuilder()
                      .setColor('#0099ff')
                      .setDescription(`<@${member.id}>, el canal ha sido revelado correctamente.`)

                    message.channel.send({ 
                      embeds: [embed]
                    });
                  })
                }
              }
              
            }

            if (message.content.startsWith('!voice-mute')) {
              // UNDER DEVELOPMENT
            }

          }else{
            const embed = new EmbedBuilder()
              .setColor('#0099ff')
              .setDescription(`<@${member.id}>, no eres un maestro de bots ni el propietario de este canal de voz temporal.`)

            message.channel.send({ 
              embeds: [embed]
            });
          }
        }else{
          console.log('Channel not in database')
        }
      } else {
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setDescription(`<@${member.id}>, no estás conectado a un canal de voz temporal.`)

        message.channel.send({ 
          embeds: [embed]
        });
      }

    }

});

channelInfo = [[0, 0, 0, []]]

client.on('voiceStateUpdate', async (oldState, newState) => {
  
  console.log(channelInfo)

  if (oldState.channel && (!newState.channel || oldState.channel.id !== newState.channel.id)) {
    // Extract the channel name and check the format
    const channelName = oldState.channel.name;
    const match = channelName.match(/^☕ Charla (\d+) Tranquila$/);

    if (match && parseInt(match[1]) > 0) {
        // Fetch the channel to check if it is now empty
        oldState.guild.channels.fetch(oldState.channel.id)
            .then(voiceChannel => {
                if (voiceChannel.members.size === 0) {
                    // Delete the channel if it's empty
                    voiceChannel.delete()
                        .then(() => {
                                console.log(`Deleted channel ${voiceChannel.name} as it's empty.`);
                                
                                const index = channelInfo.findIndex(info => info[1] === voiceChannel.id);
                                // If the item is found, remove it from channelInfo
                                if (index > -1) {
                                  channelInfo.splice(index, 1);
                                  console.log(`Removed channel info for ID ${voiceChannel.name}`);
                                }
                            })
                        .catch(console.error);
                }
            })
            .catch(console.error);
    }
  }

  if ((!oldState.channel && newState.channel && newState.channel.id === voiceChannelID) || (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id && newState.channel.id === voiceChannelID)) {

    const userOwnedVoiceIndex = channelInfo.findIndex(info => info[2] === newState.member.id);

    if (userOwnedVoiceIndex !== -1) {

      const voiceChannelId = channelInfo[userOwnedVoiceIndex][1];

      newState.guild.channels.fetch(voiceChannelId)
          .then(voiceChannel => {
              newState.member.voice.setChannel(voiceChannel)
                  .then(() => console.log(`Moved ${newState.member.displayName} to their owned channel: ${voiceChannel.name}`))
                  .catch(console.error);
          })
          .catch(console.error);
      return
    }

    let voiceNumber = channelInfo.length > 0 ? channelInfo[channelInfo.length - 1][0] + 1 : 1;

    newState.guild.channels.create({
        name: `☕ Charla ${voiceNumber} Tranquila`,
        type: ChannelType.GuildVoice,
        parent: categoryId,
        userLimit: 1,
    }).then(voiceChannel => {
        console.log(`Created new voice channel: ${voiceChannel.name}`);
        
        newState.member.voice.setChannel(voiceChannel)
        .then(() => {
            console.log(`Moved ${newState.member.displayName} to ${voiceChannel.name}`);

            channelInfo.push([voiceNumber, voiceChannel.id, newState.member.id, []]);

            voiceChannel.permissionOverwrites.edit(newState.member, {
              MoveMembers: true
            }).then(() => {
                console.log(`Permissions updated for ${newState.member.displayName}`);
            }).catch(console.error);
        })
        .catch(console.error);

    }).catch(console.error);
  }
});

client.login(tokenToStart);
