import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export async function askConfirmation(context, description) {
  const confirm = new ButtonBuilder()
    .setCustomId('confirm_yes')
    .setLabel('Yes, proceed')
    .setStyle(ButtonStyle.Danger);

  const cancel = new ButtonBuilder()
    .setCustomId('confirm_no')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(cancel, confirm);

  const userId = context.user?.id || context.author?.id;

  let replyMessage;
  if (context.reply) {
    replyMessage = await context.reply({
      content: `⚠️ **Confirm action:** ${description}\n\nReply within 30 seconds.`,
      components: [row],
      fetchReply: true,
    });
  } else if (context.editReply) {
    await context.editReply({
      content: `⚠️ **Confirm action:** ${description}\n\nReply within 30 seconds.`,
      components: [row],
    });
    replyMessage = await context.fetchReply();
  }

  return new Promise((resolve) => {
    const collector = replyMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30_000,
      filter: i => i.user.id === userId,
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'confirm_yes') {
        await i.update({ content: '⏳ Confirmed. Executing...', components: [] });
        resolve({ confirmed: true, replyMessage });
      } else {
        await i.update({ content: '✅ Cancelled.', components: [] });
        resolve({ confirmed: false, replyMessage });
      }
      collector.stop();
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        try {
          await replyMessage.edit({ content: '⏰ Confirmation timed out. Cancelled.', components: [] });
        } catch { }
        resolve({ confirmed: false, replyMessage });
      }
    });
  });
}
