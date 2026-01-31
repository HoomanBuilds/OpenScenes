import os from 'os';

// Helper to get current CPU times
function getCpuTimes() {
    const cpus = os.cpus();
    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;

    for (const cpu of cpus) {
        user += cpu.times.user;
        nice += cpu.times.nice;
        sys += cpu.times.sys;
        idle += cpu.times.idle;
        irq += cpu.times.irq;
    }

    return { user, nice, sys, idle, irq, total: user + nice + sys + idle + irq };
}

// continuous monitoring of global CPU
export function startCpuMonitor(intervalMs: number = 1000, onUpdate: (usage: number) => void) {
    let previous = getCpuTimes();
    let timer: NodeJS.Timeout;

    const tick = () => {
        const current = getCpuTimes();
        const totalDiff = current.total - previous.total;
        
        // Prevent division by zero
        if (totalDiff > 0) {
            const idleDiff = current.idle - previous.idle;
            const usage = 100 - Math.round((idleDiff / totalDiff) * 100);
            onUpdate(usage);
        }
        
        previous = current;
    };

    timer = setInterval(tick, intervalMs);

    return {
        stop: () => clearInterval(timer),
        getCurrentUsage: () => {
             const current = getCpuTimes();
             const totalDiff = current.total - previous.total;
             if (totalDiff === 0) return 0;
             const idleDiff = current.idle - previous.idle;
             return 100 - Math.round((idleDiff / totalDiff) * 100);
        }
    };
}
