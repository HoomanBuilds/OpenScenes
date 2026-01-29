import React from 'react';
import { SlideElement } from '../types';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from 'recharts';
import { parseChartData } from '../utils';

interface RegistryChartProps {
    element: SlideElement;
    scale: number;
}

export const Registry_Chart: React.FC<RegistryChartProps> = ({ element, scale }) => {
    const data = parseChartData(element.content);
    const colors = element.chartProps?.colors || ['#8884d8', '#82ca9d', '#ffc658'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: element.opacity ?? 1, scale: 1 }}
            transition={{ duration: element.animation?.duration || 0.5, delay: element.animation?.delay || 0 }}
            style={{
                position: 'absolute',
                left: element.x * scale,
                top: element.y * scale,
                width: element.width ? element.width * scale : 400 * scale,
                height: element.height ? element.height * scale : 300 * scale,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                backgroundColor: element.chartProps?.transparent ? 'transparent' : 'rgba(0,0,0,0.2)',
                borderRadius: 8 * scale,
                padding: 10 * scale,
                border: element.chartProps?.transparent ? 'none' : undefined,
                boxShadow: element.chartProps?.transparent ? 'none' : undefined
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                {element.chartType === 'line' ? (
                    <LineChart data={data}>
                        {element.chartProps?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#444" />}
                        {element.chartProps?.showXAxis && <XAxis dataKey="name" stroke="#888" fontSize={10 * scale} />}
                        {element.chartProps?.showYAxis && <YAxis stroke="#888" fontSize={10 * scale} />}
                        {element.chartProps?.showLegend && <Legend />}
                        <Line type="monotone" dataKey="value1" stroke={colors[0]} strokeWidth={2} />
                        <Line type="monotone" dataKey="value2" stroke={colors[1]} strokeWidth={2} />
                    </LineChart>
                ) : element.chartType === 'pie' ? (
                    <PieChart>
                         {element.chartProps?.showLegend && <Legend />}
                        <Pie data={data} dataKey="value1" nameKey="name" cx="50%" cy="50%" outerRadius="80%" fill="#8884d8">
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                ) : element.chartType === 'area' ? (
                    <AreaChart data={data}>
                        {element.chartProps?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#444" />}
                         {element.chartProps?.showXAxis && <XAxis dataKey="name" stroke="#888" fontSize={10 * scale} />}
                        {element.chartProps?.showYAxis && <YAxis stroke="#888" fontSize={10 * scale} />}
                        {element.chartProps?.showLegend && <Legend />}
                        <Area type="monotone" dataKey="value1" stroke={colors[0]} fill={colors[0]} />
                    </AreaChart>
                ) : (
                    <BarChart data={data}>
                        {element.chartProps?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#444" />}
                         {element.chartProps?.showXAxis && <XAxis dataKey="name" stroke="#888" fontSize={10 * scale} />}
                        {element.chartProps?.showYAxis && <YAxis stroke="#888" fontSize={10 * scale} />}
                        {element.chartProps?.showLegend && <Legend />}
                        <Bar dataKey="value1" fill={colors[0]} />
                        <Bar dataKey="value2" fill={colors[1]} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </motion.div>
    );
};
