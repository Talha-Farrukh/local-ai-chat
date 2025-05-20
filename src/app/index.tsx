import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ModelCard } from "../components/model/ModelCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useModels } from "../hooks/useModels";
import { COLORS } from "../lib/constants";

type Tab = "downloaded" | "all";

export default function ModelsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("downloaded");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    availableModels,
    downloadedModels,
    downloading,
    error,
    isLoadingDownloaded,
    isLoadingAvailable,
    isConnected,
    downloadModel,
    deleteModel,
  } = useModels();

  const handleModelPress = (modelId: string) => {
    const model = downloadedModels.find((m) => m.id === modelId);
    if (model) {
      router.push(`/${modelId}`);
    }
  };

  const handleDeleteModel = (modelId: string, modelName: string) => {
    Alert.alert(
      "Delete Model",
      `Are you sure you want to delete ${modelName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteModel(modelId),
        },
      ],
    );
  };

  const filteredModels = useCallback(() => {
    const models =
      activeTab === "downloaded" ? downloadedModels : availableModels;
    if (!searchQuery) return models;

    const query = searchQuery.toLowerCase();
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        model.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [activeTab, searchQuery, downloadedModels, availableModels]);

  const renderContent = () => {
    const isLoading =
      activeTab === "downloaded" ? isLoadingDownloaded : isLoadingAvailable;

    if (error && activeTab === "downloaded") {
      return <ErrorMessage message={error} onRetry={() => {}} fullScreen />;
    }

    if (isLoading && (activeTab === "downloaded" || isConnected)) {
      return (
        <LoadingSpinner
          text={`Loading ${activeTab === "downloaded" ? "downloaded" : "available"} models...`}
          fullScreen
        />
      );
    }

    const models = filteredModels();
    if (models.length === 0) {
      let title, description;
      if (searchQuery) {
        title = "No matches found";
        description = `No models match your search "${searchQuery}"`;
      } else if (activeTab === "downloaded") {
        title = "No Downloaded Models";
        description =
          "You haven't downloaded any models yet. Switch to 'All Models' to browse available models.";
      } else {
        title = isConnected ? "No Models Available" : "No Internet Connection";
        description = isConnected
          ? "There are no models available at the moment. Please try again later."
          : "Connect to the internet to browse available models. Models will be loaded automatically when connected.";
      }

      return (
        <EmptyState
          title={title}
          description={description}
          icon={
            <Ionicons
              name={
                searchQuery
                  ? "search-outline"
                  : isConnected
                    ? "cube-outline"
                    : "wifi-outline"
              }
              size={48}
              color={COLORS.TEXT.SECONDARY}
            />
          }
          actionLabel={searchQuery ? "Clear Search" : undefined}
          onAction={searchQuery ? () => setSearchQuery("") : undefined}
        />
      );
    }

    return (
      <FlatList
        data={models}
        keyExtractor={(model) => model.id}
        renderItem={({ item: model }) => (
          <ModelCard
            model={model}
            onPress={() => handleModelPress(model.id)}
            onDownload={() => downloadModel(model)}
            onDelete={() => handleDeleteModel(model.id, model.name)}
            downloadProgress={downloading[model.id]}
            isDownloading={downloading[model.id] !== undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "downloaded" && styles.activeTab]}
          onPress={() => setActiveTab("downloaded")}
        >
          <Ionicons
            name={activeTab === "downloaded" ? "save" : "save-outline"}
            size={20}
            color={
              activeTab === "downloaded"
                ? COLORS.PRIMARY
                : COLORS.TEXT.SECONDARY
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "downloaded" && styles.activeTabText,
            ]}
          >
            Downloaded
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Ionicons
            name={activeTab === "all" ? "grid" : "grid-outline"}
            size={20}
            color={activeTab === "all" ? COLORS.PRIMARY : COLORS.TEXT.SECONDARY}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All Models
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORS.TEXT.SECONDARY}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search models..."
          placeholderTextColor={COLORS.TEXT.TERTIARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.TEXT.SECONDARY}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.PRIMARY + "10",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.TEXT.SECONDARY,
  },
  activeTabText: {
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    color: COLORS.TEXT.PRIMARY,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
