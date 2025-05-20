import * as FileSystem from "expo-file-system";
import { Model, DownloadedModel } from "../types/app.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MODELS_STORAGE_KEY = "@local_ai_chat/models";
const MODELS_DIRECTORY = `${FileSystem.documentDirectory}models/`;

export class ModelService {
  private static instance: ModelService;
  private downloadedModels: Map<string, DownloadedModel> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  private async initializeModelDirectory() {
    if (this.initialized) return;

    try {
      const dirInfo = await FileSystem.getInfoAsync(MODELS_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(MODELS_DIRECTORY, {
          intermediates: true,
        });
      }
      await this.loadDownloadedModels();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize model directory:", error);
      throw error;
    }
  }

  private async loadDownloadedModels() {
    try {
      const storedModels = await AsyncStorage.getItem(MODELS_STORAGE_KEY);
      if (storedModels) {
        const models = JSON.parse(storedModels) as DownloadedModel[];
        // Verify each model file exists
        for (const model of models) {
          const fileInfo = await FileSystem.getInfoAsync(model.localPath);
          if (fileInfo.exists) {
            this.downloadedModels.set(model.id, model);
          }
        }
        await this.saveDownloadedModels(); // Clean up any missing models
      }
    } catch (error) {
      console.error("Failed to load downloaded models:", error);
      throw error;
    }
  }

  private async saveDownloadedModels() {
    try {
      const models = Array.from(this.downloadedModels.values());
      await AsyncStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));
    } catch (error) {
      console.error("Failed to save downloaded models:", error);
      throw error;
    }
  }

  async downloadModel(
    model: Model,
    onProgress?: (progress: number) => void,
  ): Promise<DownloadedModel> {
    await this.initializeModelDirectory();
    const modelPath = `${MODELS_DIRECTORY}${model.id}`;

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        `https://huggingface.co/${model.repo}/resolve/main/${model.file}`,
        modelPath,
        {},
        (downloadProgress) => {
          if (
            downloadProgress.totalBytesWritten ===
            downloadProgress.totalBytesExpectedToWrite
          ) {
            onProgress?.(100);
          } else {
            const progress =
              (downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite) *
              100;
            onProgress?.(Math.round(progress));
          }
        },
      );

      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error("Download failed");

      const downloadedModel: DownloadedModel = {
        ...model,
        localPath: result.uri,
        downloadedAt: Date.now(),
        downloaded: true,
      };

      this.downloadedModels.set(model.id, downloadedModel);
      await this.saveDownloadedModels();

      return downloadedModel;
    } catch (error) {
      console.error("Failed to download model:", error);
      throw error;
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    await this.initializeModelDirectory();
    const model = this.downloadedModels.get(modelId);
    if (!model) return;

    try {
      await FileSystem.deleteAsync(model.localPath);
      this.downloadedModels.delete(modelId);
      await this.saveDownloadedModels();
    } catch (error) {
      console.error("Failed to delete model:", error);
      throw error;
    }
  }

  async getDownloadedModels(): Promise<DownloadedModel[]> {
    await this.initializeModelDirectory();
    return Array.from(this.downloadedModels.values());
  }

  async isModelDownloaded(modelId: string): Promise<boolean> {
    await this.initializeModelDirectory();
    return this.downloadedModels.has(modelId);
  }

  async getModelPath(modelId: string): Promise<string | null> {
    await this.initializeModelDirectory();
    const model = this.downloadedModels.get(modelId);
    return model ? model.localPath : null;
  }
}
