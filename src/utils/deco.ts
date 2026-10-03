// â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
// â•‘              GhostSaver â€” Utility: Deco                     â•‘
// â•‘              Sistema de decoraciones (Estilo Mitsuri-TS)     â•‘
// â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export class Deco {
    static header(title: string): string {
        return `*_â˜‘ï¸Ž ${title.toUpperCase()} â˜‘ï¸Ž_*\n`;
    }

    static footer(text: string): string {
        return `\nâœŽ ${text.toUpperCase()} âœŽ`;
    }

    static blockquote(text: string): string {
        return text.split('\n').map(line => {
            if (line.trim() === '') return ''; 
            return `> ${line.trimStart()}`;
        }).join('\n');
    }

    static quote(text: string): string {
        return this.blockquote(text);
    }

    static commandUsage(name: string, aliases: any = [], prefix: string = "."): string {
        const aliasArr: string[] = Array.isArray(aliases) ? aliases : (aliases ? [String(aliases)] : []);
        const aliasesText = aliasArr.length > 0 ? aliasArr.map(a => ` \`${prefix}${a}\``).join('') : '';
        return `> âœŽ *${prefix}${name}*${aliasesText}`;
    }

    static listItem(title: string, value: string): string {
        return `> â˜ *${title}:* ${value}`;
    }

    static successLine(text: string): string {
        return this.blockquote(`âœ“ ${text}`);
    }

    static warnLine(text: string): string {
        return this.blockquote(`âœ˜ ${text}`);
    }

    static errorLine(text: string): string {
        return this.blockquote(`âœ–ï¸Ž ${text}`);
    }

    static infoLine(text: string): string {
        return this.blockquote(`âœŽ ${text}`);
    }
}


