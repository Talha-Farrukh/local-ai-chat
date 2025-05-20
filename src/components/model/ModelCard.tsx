import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Model } from "../../types/app.types";
import { formatBytes } from "../../lib/utils";
import { COLORS } from "../../lib/constants";
import { Button } from "../ui/button";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "../ui/ProgressBar";

interface ModelCardProps {
  model: Model;
  onPress: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  downloadProgress?: number;
  isDownloading?: boolean;
}

export function ModelCard({
  model,
  onPress,
  onDownload,
  onDelete,
  downloadProgress,
  isDownloading,
}: Readonly<ModelCardProps>) {
  return (
    <TouchableOpacity
      style={[styles.container, model.downloaded && styles.downloadedContainer]}
      onPress={onPress}
      disabled={isDownloading}
    >
      {/* Model Icon and Status */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={model.downloaded ? "cube" : "cube-outline"}
            size={28}
            color={model.downloaded ? COLORS.PRIMARY : COLORS.TEXT.SECONDARY}
          />
          {model.downloaded && (
            <View style={styles.statusBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.STATUS.SUCCESS}
              />
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {model.downloaded ? (
            <View style={styles.downloadedBadge}>
              <Text style={styles.downloadedText}>Downloaded</Text>
            </View>
          ) : (
            <Text style={styles.modelType}>GGUF Model</Text>
          )}
        </View>
      </View>

      {/* Model Info */}
      <View style={styles.content}>
        <Text style={styles.name}>{model.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {model.description}
        </Text>

        {/* Tags */}
        <View style={styles.tags}>
          {model.tags.map((tag, index) => (
            <View key={"tags" + index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Model Details */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons
              name="file-tray-outline"
              size={16}
              color={COLORS.TEXT.SECONDARY}
            />
            <Text style={styles.detailText}>{model.file}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="git-branch-outline"
              size={16}
              color={COLORS.TEXT.SECONDARY}
            />
            <Text style={styles.detailText}>{model.repo.split("/")[1]}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="cube-outline"
              size={16}
              color={COLORS.TEXT.SECONDARY}
            />
            <Text style={styles.detailText}>
              {formatBytes(model.usedStorage)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={COLORS.TEXT.SECONDARY}
            />
            <Text style={styles.detailText}>Updated {model.lastModified}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="layers-outline"
              size={16}
              color={COLORS.TEXT.SECONDARY}
            />
            <Text style={styles.detailText}>
              {model.downloadCount} downloads
            </Text>
          </View>
        </View>
      </View>

      {/* Download Progress or Actions */}
      <View style={styles.footer}>
        {isDownloading ? (
          <View style={styles.downloadingContainer}>
            <ProgressBar
              progress={downloadProgress ?? 0}
              height={4}
              showPercentage={false}
            />
            <Text style={styles.downloadingText}>
              Downloading... {downloadProgress}%
            </Text>
          </View>
        ) : (
          <View style={styles.actions}>
            {model.downloaded ? (
              <>
                <Button variant="outline" size="sm" onPress={onPress}>
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color={COLORS.PRIMARY}
                    />
                    <Text style={styles.buttonText}>Chat</Text>
                  </View>
                </Button>
                {onDelete && (
                  <TouchableOpacity
                    onPress={onDelete}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={COLORS.STATUS.ERROR}
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onPress={onDownload}
                isLoading={isDownloading}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color={COLORS.TEXT.INVERSE}
                  />
                  <Text
                    style={[styles.buttonText, { color: COLORS.TEXT.INVERSE }]}
                  >
                    Download
                  </Text>
                </View>
              </Button>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.TEXT.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: width - 32,
  },
  downloadedContainer: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  downloadedBadge: {
    backgroundColor: COLORS.STATUS.SUCCESS + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  downloadedText: {
    color: COLORS.STATUS.SUCCESS,
    fontSize: 12,
    fontWeight: "600",
  },
  modelType: {
    color: COLORS.TEXT.SECONDARY,
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT.SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.TEXT.SECONDARY,
  },
  footer: {
    marginTop: "auto",
  },
  downloadingContainer: {
    gap: 8,
  },
  downloadingText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: "500",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: COLORS.STATUS.ERROR + "10",
    borderRadius: 8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.PRIMARY + "10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: "500",
  },
});
