import { Easing, interpolate, useCurrentFrame } from "remotion";

const parseChartData = (content: string): any[] => {
    if (!content) return [];
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
        const parts = line.split(/\s+/);
        const name = parts[0] || '';
        const values: Record<string, number> = {};
        for (let i = 1; i < parts.length; i++) {
            const num = parseFloat(parts[i]);
            if (!isNaN(num)) {
                values[`value${i}`] = num;
            }
        }
        return { name, ...values };
    });
};



const useAnimatedChartData = (data: any[], frame: number, animationFrames: number = 30) => {
    const progress = interpolate(frame, [0, animationFrames], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    
    return data.map(item => {
        const animated: any = { name: item.name };
        Object.keys(item).forEach(key => {
            if (key.startsWith('value')) {
                animated[key] = item[key] * progress;
            }
        });
        return animated;
    });
};


export { 
  parseChartData, 
  useAnimatedChartData
}