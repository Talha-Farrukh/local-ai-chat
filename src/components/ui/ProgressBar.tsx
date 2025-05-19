import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../lib/constants';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  height = 8,
  backgroundColor = COLORS.BORDER,
  progressColor = COLORS.PRIMARY,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.progress,
            {
              width: `${percentage}%`,
              height,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  percentage: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
  },
}); 