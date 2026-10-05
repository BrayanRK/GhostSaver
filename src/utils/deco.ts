// \u{2554}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2557}
// \u{2551}              GhostSaver - Utility: Deco                     \u{2551}
// \u{2551}              Sistema de decoraciones (Estilo Mitsuri-TS)     \u{2551}
// \u{255A}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{2550}\u{255D}

export class Deco {
    static header(title: string): string {
        return `*_\u{2611} ${title.toUpperCase()} \u{2611}_*\n`;
    }

    static footer(text: string): string {
        return `\n\u{270E} ${text.toUpperCase()} \u{270E}`;
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
        return `> \u{270E} *${prefix}${name}*${aliasesText}`;
    }

    static listItem(title: string, value: string): string {
        return `> \u{2606} *${title}:* ${value}`;
    }

    static successLine(text: string): string {
        return this.blockquote(`\u{2714} ${text}`);
    }

    static warnLine(text: string): string {
        return this.blockquote(`\u{2718} ${text}`);
    }

    static errorLine(text: string): string {
        return this.blockquote(`\u{2716} ${text}`);
    }

    static infoLine(text: string): string {
        return this.blockquote(`\u{270E} ${text}`);
    }
}
