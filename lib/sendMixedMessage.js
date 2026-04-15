// from RHNX with a

"use strict";

import { generateWAMessageFromContent } from "baileys";

function detectLang(code) {
    if (/import .* from|require\(|module\.exports/.test(code)) return "javascript";
    if (/def |print\(|import /.test(code)) return "python";
    if (/<\/?[a-z][\s\S]*>/i.test(code)) return "html";
    if (/SELECT |INSERT |UPDATE |DELETE /i.test(code)) return "sql";
    if (/package main|fmt\.Print/.test(code)) return "go";
    if (/using System|Console\.WriteLine/.test(code)) return "csharp";
    if (/public class|System\.out\.println/.test(code)) return "java";
    if (/#include|printf\(/.test(code)) return "c";
    return "plaintext";
}

function tokenize(line) {
    return line.match(/"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|#.*|\b[a-zA-Z_][a-zA-Z0-9_]*\b|\s+|./g) || [];
}

function getHighlight(token) {
    if (/^\s+$/.test(token)) return 0;
    if (/^\/\/|^#/.test(token)) return 5;
    if (/^"[^"]*"|^'[^']*'|^`[^`]*`$/.test(token)) return 3;
    if (/^(import|export|from|require|module)$/.test(token)) return 1;
    if (/^(const|let|var|function|class|if|else|for|while|switch|case|break|continue|new|try|catch|finally|throw|async|await)$/.test(token)) return 2;
    if (/^return$/.test(token)) return 4;
    return 0;
}

function parseCodeBlocks(code) {
    const lines = code.split('\n');
    const result = [];

    for (let line of lines) {
        const tokens = tokenize(line);
        for (let token of tokens) {
            result.push({
                highlightType: getHighlight(token),
                codeContent: token
            });
        }
        result.push({ highlightType: 0, codeContent: '\n' });
    }

    return result;
}

function looksLikeCode(text) {
    return /import |function |const |let |var |=>|class |#include|def |SELECT |<html/i.test(text);
}

function parseMixedContent(text) {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let result = [];

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const textPart = text.slice(lastIndex, match.index).trim();
            if (textPart) {
                if (looksLikeCode(textPart)) {
                    result.push({
                        type: "code",
                        lang: detectLang(textPart),
                        content: textPart
                    });
                } else {
                    result.push({ type: "text", content: textPart });
                }
            }
        }

        result.push({
            type: "code",
            lang: match[1] || detectLang(match[2]),
            content: match[2].trim()
        });

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        const textPart = text.slice(lastIndex).trim();
        if (textPart) {
            if (looksLikeCode(textPart)) {
                result.push({
                    type: "code",
                    lang: detectLang(textPart),
                    content: textPart
                });
            } else {
                result.push({ type: "text", content: textPart });
            }
        }
    }

    return result;
}

async function sendMixedMessage(conn, m, text) {
    const jid = m.chat;
    const parts = parseMixedContent(text);
    const submessages = [];

    for (let part of parts) {
        if (part.type === "text") {
            submessages.push({
                messageType: 2,
                messageText: part.content
            });
        }

        if (part.type === "code") {
            submessages.push({
                messageType: 5,
                codeMetadata: {
                    codeLanguage: part.lang,
                    codeBlocks: parseCodeBlocks(part.content)
                }
            });
        }
    }

    submessages.push({
        messageType: 2,
        messageText: `> RHNX`
    });

    const msgContent = {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    submessages,
                    contextInfo: {
                        forwardingScore: 0,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid: "6283829214981@s.whatsapp.net"
                        },
                        forwardOrigin: 4,
     participant: m.sender,
    stanzaId: m.key.id,
    quotedMessage: m.message
}
                }
            }
        }
    };

    let msg = await generateWAMessageFromContent(
        jid,
        msgContent,
        { quoted: m, userJid: conn.user.id }
    );

    await conn.relayMessage(jid, msg.message, {
        messageId: msg.key.id
    });
}

export { sendMixedMessage };
