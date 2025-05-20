import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { ModelService } from "../lib/model.service";
import { DownloadedModel, Model } from "../types/app.types";
import NetInfo from "@react-native-community/netinfo";

const MODEL_REPOS = {
  "Llama-3.2-1B-Instruct": {
    repo: "medmekk/Llama-3.2-1B-Instruct.GGUF",
    description: "A lightweight instruction-tuned model based on Llama 2",
    tags: ["instruction-tuned", "chat", "english"],
  },
  "DeepSeek-R1-Distill-Qwen-1.5B": {
    repo: "medmekk/DeepSeek-R1-Distill-Qwen-1.5B.GGUF",
    description: "Distilled version of DeepSeek optimized for mobile devices",
    tags: ["distilled", "multilingual", "efficient"],
  },
  "Qwen2-0.5B-Instruct": {
    repo: "medmekk/Qwen2.5-0.5B-Instruct.GGUF",
    description: "Ultra-lightweight instruction model from Alibaba",
    tags: ["instruction-tuned", "chinese", "english"],
  },
  "SmolLM2-1.7B-Instruct": {
    repo: "medmekk/SmolLM2-1.7B-Instruct.GGUF",
    description: "Compact yet powerful instruction-following model",
    tags: ["instruction-tuned", "english", "efficient"],
  },
};

export function useModels() {
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [downloadedModels, setDownloadedModels] = useState<DownloadedModel[]>(
    [],
  );
  const [downloading, setDownloading] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDownloaded, setIsLoadingDownloaded] = useState(true);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const modelService = ModelService.getInstance();

  const loadDownloadedModels = useCallback(async () => {
    try {
      setIsLoadingDownloaded(true);
      const downloaded = await modelService.getDownloadedModels();
      setDownloadedModels(downloaded);
      setError(null);
    } catch (err) {
      console.error("Failed to load downloaded models:", err);
      setError("Failed to load downloaded models");
    } finally {
      setIsLoadingDownloaded(false);
    }
  }, []);

  const fetchAvailableModels = useCallback(async () => {
    if (!isConnected) {
      setAvailableModels([]);
      setIsLoadingAvailable(false);
      return;
    }

    try {
      setIsLoadingAvailable(true);
      const models: Model[] = [];
      const downloadedModelIds = new Set(downloadedModels.map((m) => m.id));

      for (const [name, info] of Object.entries(MODEL_REPOS)) {
        try {
          const response = await axios.get(
            `https://huggingface.co/api/models/${info.repo}`,
          );
          const files = response.data.siblings.filter((file: any) =>
            file.rfilename.endsWith(".gguf"),
          );

          console.log(response.data);

          for (const file of files) {
            const isDownloaded = downloadedModelIds.has(file.rfilename);
            models.push({
              id: file.rfilename,
              name: name,
              description: info.description,
              tags: info.tags,
              parameters: response.data.model_info?.parameters ?? "Unknown",
              usedStorage: response.data.usedStorage ?? "Unknown",
              downloadCount: response.data.downloads ?? "Unknown",
              lastModified: new Date(
                response.data.lastModified,
              ).toLocaleDateString(),
              repo: info.repo,
              file: file.rfilename,
              downloaded: isDownloaded,
              size: file.size,
            });
          }
        } catch (err) {
          console.error(`Failed to fetch model ${name}:`, err);
        }
      }

      setAvailableModels(models);
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [downloadedModels, isConnected]);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasConnected = isConnected;
      const nowConnected = state.isConnected;
      setIsConnected(nowConnected);

      // If connection was restored, clear any previous errors
      if (!wasConnected && nowConnected) {
        setError(null);
      }
    });

    // Initial network check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      // Only start loading available models if we're online
      setIsLoadingAvailable(state.isConnected === true);
    });

    return () => unsubscribe();
  }, [isConnected]);

  // Load downloaded models immediately on mount
  useEffect(() => {
    loadDownloadedModels();
  }, [loadDownloadedModels]);

  // Fetch available models when connection changes
  useEffect(() => {
    if (isConnected) {
      fetchAvailableModels();
    } else if (isConnected === false) {
      // explicitly check for false to handle initial null state
      setAvailableModels([]);
      setIsLoadingAvailable(false);
    }
  }, [isConnected, fetchAvailableModels]);

  const downloadModel = useCallback(
    async (model: Model) => {
      if (!isConnected) {
        setError("Internet connection required to download models");
        return;
      }

      try {
        setDownloading((prev) => ({ ...prev, [model.id]: 0 }));
        setError(null);

        await modelService.downloadModel(model, (progress) => {
          setDownloading((prev) => ({ ...prev, [model.id]: progress }));
        });

        await loadDownloadedModels();
        await fetchAvailableModels();
      } catch (err) {
        setError(`Failed to download ${model.name}`);
        console.error("Failed to download model:", err);
      } finally {
        setDownloading((prev) => {
          const updated = { ...prev };
          delete updated[model.id];
          return updated;
        });
      }
    },
    [isConnected, loadDownloadedModels, fetchAvailableModels],
  );

  const deleteModel = useCallback(
    async (modelId: string) => {
      try {
        await modelService.deleteModel(modelId);
        await loadDownloadedModels();
        await fetchAvailableModels();
        setError(null);
      } catch (err) {
        setError("Failed to delete model");
        console.error("Failed to delete model:", err);
      }
    },
    [loadDownloadedModels, fetchAvailableModels],
  );

  return {
    availableModels,
    downloadedModels,
    downloading,
    error,
    isLoadingDownloaded,
    isLoadingAvailable,
    isConnected,
    downloadModel,
    deleteModel,
    loadDownloadedModels,
    fetchAvailableModels,
  };
}
