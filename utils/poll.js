const { createCanvas } = require('@napi-rs/canvas');
const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, EmbedBuilder,
} = require('discord.js');

const COLORS = ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245'];
const BAR_RADIUS = 14;

// pollId -> { question, options, votes: Map<userId, idx>, endsAt, ended }
const polls = new Map();

// "30s", "10m", "2h", "1d" -> milliseconds (or null if invalid)
function parseDuration(str) {
  const m = /^(\d+)\s*(s|m|h|d)$/i.exec(str.trim());
  if (!m) return null;
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2].toLowerCase()];
  return Number(m[1]) * mult;
}

function getResults(poll) {
  const counts = poll.options.map((_, i) =>
    [...poll.votes.values()].filter(v => v === i).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(...counts);
  // On a tie, every option with the top score is a winner
  const winners = total === 0 ? [] : counts.flatMap((c, i) => (c === max ? [i] : []));
  return { counts, total, winners };
}

function renderPoll(poll) {
  const W = 720, rowH = 78, pad = 24, barH = 28;
  const H = pad * 2 + rowH * poll.options.length;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const { counts, total, winners } = getResults(poll);

  ctx.fillStyle = '#2b2d31';
  ctx.fillRect(0, 0, W, H);
  const barW = W - pad * 2;

  poll.options.forEach((opt, i) => {
    const y = pad + i * rowH;
    const pct = total ? counts[i] / total : 0;
    const isWinner = poll.ended && winners.includes(i);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(opt, pad, y + 20);

    if (isWinner) {
      const w = ctx.measureText(opt).width;
      ctx.fillStyle = '#FEE75C';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('WINNER', pad + w + 12, y + 20);
    }

    ctx.fillStyle = '#b5bac1';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${counts[i]} vote${counts[i] === 1 ? '' : 's'} • ${Math.round(pct * 100)}%`, W - pad, y + 20);

    const by = y + 32;
    ctx.fillStyle = '#1e1f22';
    ctx.beginPath();
    ctx.roundRect(pad, by, barW, barH, BAR_RADIUS);
    ctx.fill();

    if (pct > 0) {
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.beginPath();
      ctx.roundRect(pad, by, Math.max(barW * pct, BAR_RADIUS * 2), barH, BAR_RADIUS);
      ctx.fill();
    }
  });

  return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'poll.png' });
}

function resultText(poll) {
  const { total, winners } = getResults(poll);
  if (total === 0) return '🔒 **Poll closed.** Nobody voted.';
  if (winners.length === 1) return `🔒 **Poll closed.**\n🏆 Winner: **${poll.options[winners[0]]}**`;
  const names = winners.map(i => `**${poll.options[i]}**`).join(' & ');
  return `🔒 **Poll closed.**\n🤝 It's a tie! Winners: ${names}`;
}

function buildMessage(pollId) {
  const poll = polls.get(pollId);
  const { total } = getResults(poll);

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${poll.question}`)
    .setColor(poll.ended ? '#FEE75C' : '#5865F2')
    .setDescription(poll.ended ? resultText(poll) : `⏳ Ends <t:${Math.floor(poll.endsAt / 1000)}:R>`)
    .setImage('attachment://poll.png')
    .setFooter({ text: `${total} total vote${total === 1 ? '' : 's'}` });

  const row = new ActionRowBuilder().addComponents(
    poll.options.map((opt, i) =>
      new ButtonBuilder()
        .setCustomId(`poll:${pollId}:${i}`)
        .setLabel(opt.slice(0, 80))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(poll.ended))
  );

  return { embeds: [embed], files: [renderPoll(poll)], components: [row] };
}

module.exports = { polls, buildMessage, parseDuration };