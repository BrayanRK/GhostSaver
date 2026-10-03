// ╔══════════════════════════════════════════════════════════════════╗
// ║              GhostSaver – Utility: Deco                     ║
// ║              Sistema de decoraciones (Estilo Mitsuri-TS)     ║
// ╚══════════════════════════════════════════════════════════════════╝

export class Deco {
    static header(title: string): string {
        return `*_☑️ ${title.toUpperCase()} ☑️_*\n`;
    }

    static footer(text: string): string {
        return `\n✎ ${text.toUpperCase()} ✎`;
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
        const aliasArr: string[] = Array.isArray(aliases)
            ? aliases
            : (aliases ? [String(aliases)] : []);
        const aliasesText = aliasArr.length > 0
            ? aliasArr.map(a => ` \`${prefix}${a}\``).join('')
            : '';
        return `> ✎ *${prefix}${name}*${aliasesText}`;
    }

    static listItem(title: string, value: string): string {
        return `> ☆ *${title}:* ${value}`;
    }

    static successLine(text: string): string {
        return this.blockquote(`✔ ${text}`);
    }

    static warnLine(text: string): string {
        return this.blockquote(`✘ ${text}`);
    }

    static errorLine(text: string): string {
        return this.blockquote(`✖️ ${text}`);
    }

    static infoLine(text: string): string {
        return this.blockquote(`✎ ${text}`);
    }
}
