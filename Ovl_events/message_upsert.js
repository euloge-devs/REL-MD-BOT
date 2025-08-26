const {
  rankAndLevelUp,
  lecture_status,
  like_status,
  presence,
  dl_status,
  antidelete,
  antitag,
  antilink,
  antibot,
  getJid,
  mention,
  eval_exec,
  antimention,
  chatbot
} = require("./Message_upsert_events");

const { Bans } = require("../DataBase/ban");
const { Sudo } = require("../DataBase/sudo");
const { getMessage, addMessage } = require("../lib/store");
const { jidDecode, getContentType } = require("@whiskeysockets/baileys");
const evt = require("../lib/relcmd");
const config = require("../set");
const prefixe = config.PREFIXE || '';
const { get_stick_cmd } = require("../DataBase/stick_cmd");
const { list_cmd } = require('../DataBase/public_private_cmd');

const decodeJid = jid => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const decoded = jidDecode(jid) || {};
    return decoded.user && decoded.server
      ? decoded.user + '@' + decoded.server
      : jid;
  }
  return jid;
};

async function getSudoUsers() {
  try {
    const users = await Sudo.findAll({ attributes: ['id'] });
    return users.map(u => u.id.replace(/@s\.whatsapp\.net$/, ''));
  } catch {
    return [];
  }
}

async function isBanned(type, id) {
  const ban = await Bans.findOne({ where: { id, type } });
  return !!ban;
}

async function message_upsert(m, sock) {
  try {
    if (m.type !== 'notify') return;
    const msg = m.messages?.[0];
    if (!msg?.message) return;

    addMessage(msg.key.id, msg);
    const type = getContentType(msg.message);
    const textMap = {
      conversation: msg.message.conversation,
      imageMessage: msg.message.imageMessage?.caption,
      videoMessage: msg.message.videoMessage?.caption,
      extendedTextMessage: msg.message.extendedTextMessage?.text,
      buttonsResponseMessage: msg.message.buttonsResponseMessage?.selectedButtonId,
      listResponseMessage: msg.message.listResponseMessage?.singleSelectReply?.selectedRowId,
      messageContextInfo: msg.message.buttonsResponseMessage?.selectedButtonId
        || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId
        || msg.text
    };
    const text = textMap[type] || '';
    const remoteJid = msg.key.remoteJid;
    const senderId = decodeJid(sock.user.id);
    const senderName = senderId.split('@')[0];
    const isGroup = remoteJid.endsWith('@g.us');
    const groupMeta = isGroup ? await sock.groupMetadata(remoteJid) : {};
    const groupName = groupMeta.subject || '';
    const participants = isGroup ? groupMeta.participants : [];
    const admins = participants.filter(p => p.admin).map(p => p.jid);
    const isAdmin = isGroup && admins.includes(senderId);
    const msgFrom = isGroup
      ? await getJid(decodeJid(msg.key.participant), remoteJid, sock)
      : msg.key.fromMe
      ? senderId
      : decodeJid(msg.key.remoteJid);
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedJid = await getJid(decodeJid(msg.message.extendedTextMessage?.contextInfo?.participant), remoteJid, sock);
    const pushName = msg.pushName;

    let args = text.trim().split(/ +/).slice(1);
    if (args.length === 0 && quotedMsg) {
      const qText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || '';
      if (typeof qText === "string" && qText.startsWith("https")) args = [qText];
    }

    const isCmd = text.startsWith(prefixe);
    const cmdName = isCmd ? text.slice(prefixe.length).trim().split(/ +/)[0].toLowerCase() : '';

    const premiumIds = ["22952222341", "22948778028"];
    const sudoIds = await getSudoUsers();
    const allPrivileged = ["22952222341", "22948778028", senderName, config.NUMERO_OWNER, ...sudoIds].map(id => id + '@s.whatsapp.net');
    const isPremium = allPrivileged.includes(msgFrom);
    const devIds = ["22952222341", "22948778028"].map(id => id + "@s.whatsapp.net");
    const isDev = devIds.includes(msgFrom);
    const canAdmin = isGroup && (admins.includes(msgFrom) || isPremium);

    const reply = text => sock.sendMessage(remoteJid, { text }, { quoted: msg });
    const msgInfo = {
      verif_Groupe: isGroup,
      mbre_membre: participants,
      membre_Groupe: msgFrom,
      verif_Admin: canAdmin,
      infos_Groupe: groupMeta,
      nom_Groupe: groupName,
      auteur_Message: msgFrom,
      nom_Auteur_Message: pushName,
      id_Bot: senderId,
      prenium_id: isPremium,
      dev_id: isDev,
      dev_num: devIds,
      id_Bot_N: senderName,
      verif_Rel_Admin: isAdmin,
      prefixe,
      arg: args,
      repondre: reply,
      groupe_Admin: () => admins,
      msg_Repondu: quotedMsg,
      auteur_Msg_Repondu: quotedJid,
      ms: msg,
      ms_org: remoteJid,
      texte: text,
      getJid
    };

    const runCmd = async cmd => {
      const privateCmds = await list_cmd("private");
      const publicCmds = await list_cmd("public");
      const isPrivateBlocked = privateCmds.some(c => c.nom_cmd === cmd.nom_cmd || cmd.alias?.includes(c.nom_cmd));
      const isPublicBlocked = publicCmds.some(c => c.nom_cmd === cmd.nom_cmd || cmd.alias?.includes(c.nom_cmd));

      if (config.MODE !== "public" && !isPremium && !isPublicBlocked) return;
      if (config.MODE === "public" && !isPremium && isPrivateBlocked) return;

      if (!isPremium && (await isBanned("user", msgFrom))) return;
      if (!isPremium && isGroup && (await isBanned("group", remoteJid))) return;

      await sock.sendMessage(remoteJid, { react: { text: cmd.react || '🎐', key: msg.key } });
      cmd.fonction(remoteJid, sock, msgInfo);
    };

    if (isCmd) {
      const cmd = evt.cmd.find(c => c.nom_cmd === cmdName || c.alias?.includes(cmdName));
      if (cmd) await runCmd(cmd);
    }

    if (msg?.message?.stickerMessage) {
      try {
        const stickCmds = await get_stick_cmd();
        const cmdData = stickCmds.find(s => s.stick_url === msg.message.stickerMessage.url);
        if (cmdData) {
          const cmd = evt.cmd.find(c => c.nom_cmd === cmdData.no_cmd || c.alias?.includes(cmdData.no_cmd));
          if (cmd) await runCmd(cmd);
        }
      } catch (e) {
        console.error("Erreur sticker command:", e);
      }
    }

    rankAndLevelUp(sock, remoteJid, text, msgFrom, pushName, config);
    presence(sock, remoteJid);
    lecture_status(sock, msg, remoteJid);
    like_status(sock, msg, remoteJid, senderId);
    dl_status(sock, remoteJid, msg);
    eval_exec(sock, { ...msgInfo });
    chatbot(remoteJid, isGroup, text, reply);
    antidelete(sock, msg, msgFrom, type, getMessage);
    antimention(sock, remoteJid, msg, isGroup, canAdmin, isAdmin, msgFrom);
    antitag(sock, msg, remoteJid, type, isGroup, isAdmin, canAdmin, msgFrom);
    mention(sock, remoteJid, msg, type, isGroup, senderId, reply);
    antilink(sock, remoteJid, msg, text, isGroup, canAdmin, isAdmin, msgFrom);
    antibot(sock, remoteJid, msg, isGroup, canAdmin, isAdmin, msgFrom);

  } catch (err) {
    console.error("❌ Erreur(message.upsert):", err);
  }
}

module.exports = message_upsert;
