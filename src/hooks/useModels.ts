import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { ModelService } from '../lib/model.service';
import { DownloadedModel, Model } from '../types/app.types';
import { useInternetConnection } from './useInternetConnection';

const MODEL_REPOS = {
  'Llama-3.2-1B-Instruct': {
    repo: 'medmekk/Llama-3.2-1B-Instruct.GGUF',
    description: 'A lightweight instruction-tuned model based on Llama 2',
    tags: ['instruction-tuned', 'chat', 'english'],
  },
  'DeepSeek-R1-Distill-Qwen-1.5B': {
    repo: 'medmekk/DeepSeek-R1-Distill-Qwen-1.5B.GGUF',
    description: 'Distilled version of DeepSeek optimized for mobile devices',
    tags: ['distilled', 'multilingual', 'efficient'],
  },
  'Qwen2-0.5B-Instruct': {
    repo: 'medmekk/Qwen2.5-0.5B-Instruct.GGUF',
    description: 'Ultra-lightweight instruction model from Alibaba',
    tags: ['instruction-tuned', 'chinese', 'english'],
  },
  'SmolLM2-1.7B-Instruct': {
    repo: 'medmekk/SmolLM2-1.7B-Instruct.GGUF',
    description: 'Compact yet powerful instruction-following model',
    tags: ['instruction-tuned', 'english', 'efficient'],
  },
};

export function useModels() {
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [downloadedModels, setDownloadedModels] = useState<DownloadedModel[]>([]);
  const [downloading, setDownloading] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline } = useInternetConnection();
  const modelService = ModelService.getInstance();

  const fetchAvailableModels = useCallback(async () => {
    if (!isOnline) {
      setError('No internet connection');
      setIsLoading(false);
      return;
    }

    try {
      const models: Model[] = [];
      
      for (const [name, info] of Object.entries(MODEL_REPOS)) {
        try {
          const response = await axios.get(`https://huggingface.co/api/models/${info.repo}`);
          const files = response.data.siblings.filter((file: any) => file.rfilename.endsWith('.gguf'));
          
          for (const file of files) {
            const isDownloaded = await modelService.isModelDownloaded(file.rfilename);
            models.push({
              id: file.rfilename,
              name: name,
              description: info.description,
              tags: info.tags,
              parameters: response.data.model_info?.parameters || 'Unknown',
              lastModified: new Date(file.lastModified).toLocaleDateString(),
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
      setError(null);
    } catch (err) {
      setError('Failed to fetch available models');
      console.error('Failed to fetch models:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  const loadDownloadedModels = useCallback(async () => {
    try {
      const downloaded = await modelService.getDownloadedModels();
      setDownloadedModels(downloaded);
    } catch (err) {
      console.error('Failed to load downloaded models:', err);
    }
  }, []);

  const loadModels = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchAvailableModels(),
      loadDownloadedModels(),
    ]);
  }, [fetchAvailableModels, loadDownloadedModels]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const downloadModel = useCallback(async (model: Model) => {
    if (!isOnline) {
      setError('No internet connection');
      return;
    }

    try {
      setDownloading(prev => ({ ...prev, [model.id]: 0 }));
      setError(null);

      await modelService.downloadModel(model, progress => {
        setDownloading(prev => ({ ...prev, [model.id]: progress }));
      });

      await loadModels();
    } catch (err) {
      setError(`Failed to download ${model.name}`);
      console.error('Failed to download model:', err);
    } finally {
      setDownloading(prev => {
        const updated = { ...prev };
        delete updated[model.id];
        return updated;
      });
    }
  }, [isOnline, loadModels]);

  const deleteModel = useCallback(async (modelId: string) => {
    try {
      await modelService.deleteModel(modelId);
      await loadModels();
      setError(null);
    } catch (err) {
      setError('Failed to delete model');
      console.error('Failed to delete model:', err);
    }
  }, [loadModels]);

  return {
    availableModels,
    downloadedModels,
    downloading,
    error,
    isLoading,
    downloadModel,
    deleteModel,
    loadModels,
  };
} 