'use client';

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  CartesianChart,
  Bar,
  Line,
  Area,
  CartesianAxis,
  Scatter,
} from 'victory-native';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 220;

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

// Data type for CartesianChart - must be Record<string, unknown>
interface ChartDatum extends Record<string, unknown> {
  x: number;
  y: number;
  label: string;
}

interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
  color: string;
  formatValue: (v: number) => string;
  animate?: boolean;
}

export function BarChart({ data, title, color, formatValue, animate = true }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartData: ChartDatum[] = data.map((d, i) => ({ x: i, y: d.value, label: d.label }));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
        <CartesianChart<ChartDatum, 'x', 'y'>
          data={chartData}
          xKey="x"
          yKeys={['y']}
        >
          {({ points, chartBounds, xScale, yScale }) => (
            <>
              <CartesianAxis
                xScale={xScale}
                yScale={yScale}
                xTicksNormalized={data.map((_, i) => i / Math.max(data.length - 1, 1))}
                yTicksNormalized={[0, 0.25, 0.5, 0.75, 1]}
                tickValues={{ x: data.map((_, i) => i), y: [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue] }}
                formatXLabel={(val: unknown) => data[val as number]?.label || ''}
                formatYLabel={(val: unknown) => formatValue(val as number)}
                labelColor="#6B7280"
                lineColor="#E5E7EB"
                lineWidth={0}
                labelOffset={8}
                axisSide={{ x: 'bottom', y: 'left' }}
              />
              <CartesianAxis
                xScale={xScale}
                yScale={yScale}
                xTicksNormalized={data.map((_, i) => i / Math.max(data.length - 1, 1))}
                yTicksNormalized={[0, 0.25, 0.5, 0.75, 1]}
                tickValues={{ x: data.map((_, i) => i), y: [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue] }}
                formatXLabel={(val: unknown) => data[val as number]?.label || ''}
                formatYLabel={(val: unknown) => formatValue(val as number)}
                labelColor="#6B7280"
                lineColor={{ grid: { x: '#F3F4F6', y: '#F3F4F6' }, frame: '#E5E7EB' }}
                lineWidth={{ grid: { x: 0, y: 1 }, frame: 1 }}
                labelOffset={8}
                axisSide={{ x: 'bottom', y: 'left' }}
              />
              <Bar
                points={points.y}
                chartBounds={chartBounds}
                color={color}
                barWidth={24}
                roundedCorners={{ topLeft: 4, topRight: 4 }}
                labels={{
                  position: 'top',
                  font: null,
                  color: '#FFFFFF',
                  formatLabel: (val: unknown) => formatValue(val as number),
                }}
              />
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  );
}

interface LineChartProps {
  data: ChartDataPoint[];
  title: string;
  color: string;
  formatValue: (v: number) => string;
  fillColor?: string;
  animate?: boolean;
}

export function LineChart({ data, title, color, formatValue, fillColor, animate = true }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartData: ChartDatum[] = data.map((d, i) => ({ x: i, y: d.value, label: d.label }));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
        <CartesianChart<ChartDatum, 'x', 'y'>
          data={chartData}
          xKey="x"
          yKeys={['y']}
        >
          {({ points, chartBounds, xScale, yScale }) => (
            <>
              <CartesianAxis
                xScale={xScale}
                yScale={yScale}
                xTicksNormalized={data.map((_, i) => i / Math.max(data.length - 1, 1))}
                yTicksNormalized={[0, 0.25, 0.5, 0.75, 1]}
                tickValues={{ x: data.map((_, i) => i), y: [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue] }}
                formatXLabel={(val: unknown) => data[val as number]?.label || ''}
                formatYLabel={(val: unknown) => formatValue(val as number)}
                labelColor="#6B7280"
                lineColor="#E5E7EB"
                lineWidth={0}
                labelOffset={8}
                axisSide={{ x: 'bottom', y: 'left' }}
              />
              <CartesianAxis
                xScale={xScale}
                yScale={yScale}
                xTicksNormalized={data.map((_, i) => i / Math.max(data.length - 1, 1))}
                yTicksNormalized={[0, 0.25, 0.5, 0.75, 1]}
                tickValues={{ x: data.map((_, i) => i), y: [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue] }}
                formatXLabel={(val: unknown) => data[val as number]?.label || ''}
                formatYLabel={(val: unknown) => formatValue(val as number)}
                labelColor="#6B7280"
                lineColor={{ grid: { x: '#F3F4F6', y: '#F3F4F6' }, frame: '#E5E7EB' }}
                lineWidth={{ grid: { x: 0, y: 1 }, frame: 1 }}
                labelOffset={8}
                axisSide={{ x: 'bottom', y: 'left' }}
              />
              {fillColor && (
                <Area
                  points={points.y}
                  y0={0}
                  color={fillColor}
                  opacity={0.15}
                  curveType="natural"
                />
              )}
              <Line
                points={points.y}
                color={color}
                strokeWidth={3}
                curveType="natural"
              />
              <Scatter
                points={points.y}
                color={color}
                radius={5}
                shape="circle"
              />
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  formatValue: (v: number) => string;
}

export function PieChart({ data, title, formatValue }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <View style={styles.pieContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.pieChartWrapper}>
        <View style={styles.pieLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>{formatValue(item.value)}</Text>
              <Text style={styles.legendPercent}>
                {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  trend?: { value: number; isPositive: boolean };
}

export function StatCard({ label, value, icon, color, bgColor, trend }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.isPositive ? '#22C55E' : '#EF4444'}
            />
            <Text style={[styles.trendValue, { color: trend.isPositive ? '#22C55E' : '#EF4444' }]}>
              {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
            </Text>
            <Text style={styles.trendLabel}>vs last period</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  pieContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 16,
  },
  pieChartWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieLegend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5722',
  },
  legendPercent: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});