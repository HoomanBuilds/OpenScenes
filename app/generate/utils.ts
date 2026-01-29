
export const parseChartData = (content: string) => {
    if (!content) return [];
    try {
        const lines = content.trim().split('\n').filter(l => l.trim().length > 0);
        return lines.map((line) => {
            const parts = line.trim().split(/\s+/); 
            const name = parts[0];
            const values = parts.slice(1).map(v => parseFloat(v));
            const obj: any = { name };
            values.forEach((v, i) => obj[`value${i+1}`] = isNaN(v) ? 0 : v);
            return obj;
        });
    } catch (e) {
        return [];
    }
};