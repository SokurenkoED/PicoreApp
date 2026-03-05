'use client';

import { useEffect, useMemo, useState } from 'react';

type DashboardMetrics = {
  usersTotal: number;
  adminsTotal: number;
  jobsTotal: number;
  jobsLast24h: number;
  presetsTotal: number;
  photoshootsTotal: number;
  modelsTotal: number;
  creditsIssued: number;
  creditsSpent: number;
};

type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  type: string;
  role: 'user' | 'admin';
  locale: 'en' | 'ru';
  isBlocked: boolean;
  balance: number;
  createdAt: string;
};

type AdminModel = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  providerKey: string;
  isActive: boolean;
  updatedAt: string;
};

type AdminStyle = {
  id: string;
  slug: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  faqEn: unknown;
  faqRu: unknown;
  sampleImages: unknown;
  promptTemplate: unknown;
  defaultParams: unknown;
  isPublished: boolean;
  updatedAt: string;
};

type AdminPreset = {
  id: string;
  slug: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  promptTemplate: unknown;
  defaultParams: unknown;
  coverAssetKey: string | null;
  sampleAssetKeys: unknown;
  modelId: string | null;
  isPublished: boolean;
  updatedAt: string;
  model?: {
    id: string;
    key: string;
    title: string;
  } | null;
  sampleImages?: string[];
  coverImage?: string | null;
};

type AdminPhotoshoot = {
  id: string;
  slug: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  coverAssetKey: string | null;
  galleryAssetKeys: unknown;
  presetId: string | null;
  modelId: string | null;
  isPublished: boolean;
  updatedAt: string;
  model?: {
    id: string;
    key: string;
    title: string;
  } | null;
  preset?: {
    id: string;
    slug: string;
    titleEn: string;
    titleRu: string;
  } | null;
  galleryImages?: string[];
  coverImage?: string | null;
};

type AdminArticle = {
  id: string;
  slug: string;
  titleEn: string;
  titleRu: string;
  excerptEn: string;
  excerptRu: string;
  contentEn: unknown;
  contentRu: unknown;
  coverImageUrl: string;
  coverAltEn: string | null;
  coverAltRu: string | null;
  tagsEn: unknown;
  tagsRu: unknown;
  authorName: string;
  readingMinutes: number;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

type UserForm = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  locale: 'en' | 'ru';
  isBlocked: boolean;
};

type ModelForm = {
  key: string;
  title: string;
  description: string;
  providerKey: string;
  isActive: boolean;
};

type StyleForm = {
  slug: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  faqEn: string;
  faqRu: string;
  sampleImages: string;
  promptTemplate: string;
  defaultParams: string;
  isPublished: boolean;
};

type PresetForm = {
  slug: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  promptTemplate: string;
  defaultParams: string;
  coverAssetKey: string;
  sampleAssetKeys: string;
  modelId: string;
  isPublished: boolean;
};

type PhotoshootForm = {
  slug: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  coverAssetKey: string;
  galleryAssetKeys: string;
  presetId: string;
  modelId: string;
  isPublished: boolean;
};

type ArticleForm = {
  slug: string;
  titleEn: string;
  titleRu: string;
  excerptEn: string;
  excerptRu: string;
  contentEn: string;
  contentRu: string;
  coverImageUrl: string;
  coverAltEn: string;
  coverAltRu: string;
  tagsEn: string;
  tagsRu: string;
  authorName: string;
  readingMinutes: number;
  isPublished: boolean;
  publishedAt: string;
};

type AdminSection =
  | 'overview'
  | 'orders'
  | 'users'
  | 'models'
  | 'styles'
  | 'blog'
  | 'presets'
  | 'photoshoots';

const initialModelForm: ModelForm = {
  key: 'model-new',
  title: 'New Model',
  description: '',
  providerKey: 'mock',
  isActive: true
};

const initialStyleForm: StyleForm = {
  slug: 'style-new',
  titleEn: 'Style EN',
  titleRu: 'Стиль RU',
  descriptionEn: 'Style description EN',
  descriptionRu: 'Описание стиля RU',
  faqEn: JSON.stringify([{ q: 'Q', a: 'A' }], null, 2),
  faqRu: JSON.stringify([{ q: 'Вопрос', a: 'Ответ' }], null, 2),
  sampleImages: '/templates/style-card-1.svg\n/templates/style-card-2.svg',
  promptTemplate: JSON.stringify({ system: 'Prompt' }, null, 2),
  defaultParams: JSON.stringify({ ratio: '4:5' }, null, 2),
  isPublished: true
};

const initialPresetForm: PresetForm = {
  slug: 'preset-new',
  titleEn: 'Preset EN',
  titleRu: 'Пресет RU',
  descriptionEn: 'Preset description EN',
  descriptionRu: 'Описание пресета RU',
  promptTemplate: JSON.stringify({ system: 'Preset prompt' }, null, 2),
  defaultParams: JSON.stringify({ ratio: '4:5' }, null, 2),
  coverAssetKey: '',
  sampleAssetKeys: '',
  modelId: '',
  isPublished: true
};

const initialPhotoshootForm: PhotoshootForm = {
  slug: 'photoshoot-new',
  titleEn: 'Photoshoot EN',
  titleRu: 'Фотосессия RU',
  descriptionEn: 'Photoshoot description EN',
  descriptionRu: 'Описание фотосессии RU',
  coverAssetKey: '',
  galleryAssetKeys: '',
  presetId: '',
  modelId: '',
  isPublished: true
};

const initialArticleForm: ArticleForm = {
  slug: 'new-article',
  titleEn: 'New article EN',
  titleRu: 'Новая статья RU',
  excerptEn: 'Short excerpt in English.',
  excerptRu: 'Короткий анонс на русском.',
  contentEn: JSON.stringify(
    {
      format: 'blocks',
      blocks: [{ type: 'p', text: 'Article body EN' }]
    },
    null,
    2
  ),
  contentRu: JSON.stringify(
    {
      format: 'blocks',
      blocks: [{ type: 'p', text: 'Текст статьи RU' }]
    },
    null,
    2
  ),
  coverImageUrl: '/templates/hero-shot-1.svg',
  coverAltEn: 'Article cover',
  coverAltRu: 'Обложка статьи',
  tagsEn: 'AI,Workflow',
  tagsRu: 'AI,Workflow',
  authorName: 'Picoria Editorial',
  readingMinutes: 5,
  isPublished: true,
  publishedAt: ''
};

function jsonToText(value: unknown, fallback: unknown): string {
  try {
    return JSON.stringify(value ?? fallback, null, 2);
  } catch {
    return JSON.stringify(fallback, null, 2);
  }
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

async function parseError(response: Response): Promise<Error> {
  const text = await response.text();
  return new Error(text || `Request failed (${response.status})`);
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<T>;
}

async function getImageSize(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [models, setModels] = useState<AdminModel[]>([]);
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [presets, setPresets] = useState<AdminPreset[]>([]);
  const [photoshoots, setPhotoshoots] = useState<AdminPhotoshoot[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [editingUserId, setEditingUserId] = useState<string>('');
  const [userForm, setUserForm] = useState<UserForm | null>(null);
  const [creditsDeltaByUserId, setCreditsDeltaByUserId] = useState<Record<string, string>>({});

  const [editingModelId, setEditingModelId] = useState<string>('');
  const [modelForm, setModelForm] = useState<ModelForm>(initialModelForm);

  const [editingStyleId, setEditingStyleId] = useState<string>('');
  const [styleForm, setStyleForm] = useState<StyleForm>(initialStyleForm);

  const [editingPresetId, setEditingPresetId] = useState<string>('');
  const [presetForm, setPresetForm] = useState<PresetForm>(initialPresetForm);

  const [editingPhotoshootId, setEditingPhotoshootId] = useState<string>('');
  const [photoshootForm, setPhotoshootForm] = useState<PhotoshootForm>(initialPhotoshootForm);
  const [editingArticleId, setEditingArticleId] = useState<string>('');
  const [articleForm, setArticleForm] = useState<ArticleForm>(initialArticleForm);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  const modelOptions = useMemo(
    () => models.map((item) => ({ id: item.id, label: `${item.title} (${item.key})` })),
    [models]
  );

  const presetOptions = useMemo(
    () => presets.map((item) => ({ id: item.id, label: `${item.titleEn} (${item.slug})` })),
    [presets]
  );

  const resetAlerts = () => {
    setError('');
    setMessage('');
  };

  const loadAll = async (clearAlerts = true) => {
    setLoading(true);
    if (clearAlerts) {
      resetAlerts();
    }

    try {
      const [dashboard, usersResponse, modelsResponse, stylesResponse, presetsResponse, photoshootsResponse, articlesResponse] =
        await Promise.all([
          requestJson<DashboardMetrics>('/api/admin/dashboard'),
          requestJson<AdminUser[]>('/api/admin/users'),
          requestJson<AdminModel[]>('/api/admin/models'),
          requestJson<AdminStyle[]>('/api/admin/styles'),
          requestJson<AdminPreset[]>('/api/admin/presets'),
          requestJson<AdminPhotoshoot[]>('/api/admin/photoshoots'),
          requestJson<AdminArticle[]>('/api/admin/blog/articles')
        ]);

      setMetrics(dashboard);
      setUsers(usersResponse);
      setModels(modelsResponse);
      setStyles(stylesResponse);
      setPresets(presetsResponse);
      setPhotoshoots(photoshootsResponse);
      setArticles(articlesResponse);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    resetAlerts();

    try {
      await action();
      await loadAll(false);
      setMessage(successMessage);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  };

  const uploadAdminFile = async (file: File): Promise<string> => {
    const presign = await requestJson<{ assetId: string; uploadUrl: string; storageKey: string }>(
      '/api/admin/media/presign-upload',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mime: file.type, sizeBytes: file.size })
      }
    );

    const putResponse = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });

    if (!putResponse.ok) {
      throw new Error('Failed to upload file to storage');
    }

    const size = await getImageSize(file);
    await requestJson('/api/admin/media/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: presign.assetId,
        width: size.width,
        height: size.height
      })
    });

    return presign.storageKey;
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    resetAlerts();

    try {
      const keys: string[] = [];
      for (const file of files) {
        keys.push(await uploadAdminFile(file));
      }
      setMessage('Файлы загружены в хранилище');
      return keys;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
      return [];
    } finally {
      setUploading(false);
    }
  };

  const startEditUser = (item: AdminUser) => {
    setEditingUserId(item.id);
    setUserForm({
      id: item.id,
      email: item.email ?? '',
      name: item.name ?? '',
      role: item.role,
      locale: item.locale,
      isBlocked: item.isBlocked
    });
  };

  const cancelEditUser = () => {
    setEditingUserId('');
    setUserForm(null);
  };

  const saveUser = async () => {
    if (!userForm || !editingUserId) {
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: userForm.role,
          locale: userForm.locale,
          isBlocked: userForm.isBlocked,
          email: userForm.email.trim() ? userForm.email.trim() : null,
          name: userForm.name.trim() ? userForm.name.trim() : null
        })
      });
      cancelEditUser();
    }, 'Пользователь обновлен');
  };

  const updateRoleQuick = async (userId: string, role: 'user' | 'admin') => {
    await runAction(async () => {
      await requestJson(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
    }, 'Роль обновлена');
  };

  const adjustCredits = async (userId: string) => {
    const raw = creditsDeltaByUserId[userId] ?? '';
    const delta = Number.parseInt(raw, 10);
    if (!Number.isFinite(delta) || delta === 0) {
      setError('Укажите delta кредитов (целое число, не 0)');
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      setCreditsDeltaByUserId((prev) => ({ ...prev, [userId]: '' }));
    }, 'Кредиты скорректированы');
  };

  const deleteUserRecord = async (userId: string) => {
    if (!window.confirm('Удалить пользователя? Это удалит его задания, платежи и ассеты.')) {
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (editingUserId === userId) {
        cancelEditUser();
      }
    }, 'Пользователь удален');
  };

  const startEditModel = (item: AdminModel) => {
    setEditingModelId(item.id);
    setModelForm({
      key: item.key,
      title: item.title,
      description: item.description ?? '',
      providerKey: item.providerKey,
      isActive: item.isActive
    });
  };

  const resetModelEditor = () => {
    setEditingModelId('');
    setModelForm(initialModelForm);
  };

  const saveModel = async () => {
    await runAction(async () => {
      if (editingModelId) {
        await requestJson(`/api/admin/models/${editingModelId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modelForm)
        });
      } else {
        await requestJson('/api/admin/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modelForm)
        });
      }
      resetModelEditor();
    }, editingModelId ? 'Модель обновлена' : 'Модель создана');
  };

  const deleteModel = async (id: string) => {
    if (!window.confirm('Удалить модель?')) {
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/models/${id}`, { method: 'DELETE' });
      if (editingModelId === id) {
        resetModelEditor();
      }
    }, 'Модель удалена');
  };

  const startEditStyle = (item: AdminStyle) => {
    setEditingStyleId(item.id);
    setStyleForm({
      slug: item.slug,
      titleEn: item.titleEn,
      titleRu: item.titleRu,
      descriptionEn: item.descriptionEn,
      descriptionRu: item.descriptionRu,
      faqEn: jsonToText(item.faqEn, []),
      faqRu: jsonToText(item.faqRu, []),
      sampleImages: toStringArray(item.sampleImages).join('\n'),
      promptTemplate: jsonToText(item.promptTemplate, {}),
      defaultParams: jsonToText(item.defaultParams, {}),
      isPublished: item.isPublished
    });
  };

  const resetStyleEditor = () => {
    setEditingStyleId('');
    setStyleForm(initialStyleForm);
  };

  const saveStyle = async () => {
    await runAction(async () => {
      const body = {
        slug: styleForm.slug,
        titleEn: styleForm.titleEn,
        titleRu: styleForm.titleRu,
        descriptionEn: styleForm.descriptionEn,
        descriptionRu: styleForm.descriptionRu,
        faqEn: JSON.parse(styleForm.faqEn || '[]'),
        faqRu: JSON.parse(styleForm.faqRu || '[]'),
        sampleImages: linesToArray(styleForm.sampleImages),
        promptTemplate: JSON.parse(styleForm.promptTemplate || '{}'),
        defaultParams: JSON.parse(styleForm.defaultParams || '{}'),
        isPublished: styleForm.isPublished
      };

      if (editingStyleId) {
        await requestJson(`/api/admin/styles/${editingStyleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        await requestJson('/api/admin/styles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      resetStyleEditor();
    }, editingStyleId ? 'Стиль обновлен' : 'Стиль создан');
  };

  const deleteStyle = async (id: string) => {
    if (!window.confirm('Удалить стиль?')) {
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/styles/${id}`, { method: 'DELETE' });
      if (editingStyleId === id) {
        resetStyleEditor();
      }
    }, 'Стиль удален');
  };

  const startEditPreset = (item: AdminPreset) => {
    setEditingPresetId(item.id);
    setPresetForm({
      slug: item.slug,
      titleEn: item.titleEn,
      titleRu: item.titleRu,
      descriptionEn: item.descriptionEn,
      descriptionRu: item.descriptionRu,
      promptTemplate: jsonToText(item.promptTemplate, {}),
      defaultParams: jsonToText(item.defaultParams, {}),
      coverAssetKey: item.coverAssetKey ?? '',
      sampleAssetKeys: toStringArray(item.sampleAssetKeys).join('\n'),
      modelId: item.modelId ?? '',
      isPublished: item.isPublished
    });
  };

  const resetPresetEditor = () => {
    setEditingPresetId('');
    setPresetForm(initialPresetForm);
  };

  const savePreset = async () => {
    await runAction(async () => {
      const body = {
        slug: presetForm.slug,
        titleEn: presetForm.titleEn,
        titleRu: presetForm.titleRu,
        descriptionEn: presetForm.descriptionEn,
        descriptionRu: presetForm.descriptionRu,
        promptTemplate: JSON.parse(presetForm.promptTemplate || '{}'),
        defaultParams: JSON.parse(presetForm.defaultParams || '{}'),
        coverAssetKey: presetForm.coverAssetKey.trim() ? presetForm.coverAssetKey.trim() : null,
        sampleAssetKeys: linesToArray(presetForm.sampleAssetKeys),
        modelId: presetForm.modelId || null,
        isPublished: presetForm.isPublished
      };

      if (editingPresetId) {
        await requestJson(`/api/admin/presets/${editingPresetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        await requestJson('/api/admin/presets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      resetPresetEditor();
    }, editingPresetId ? 'Пресет обновлен' : 'Пресет создан');
  };

  const deletePreset = async (id: string) => {
    if (!window.confirm('Удалить пресет?')) {
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/presets/${id}`, { method: 'DELETE' });
      if (editingPresetId === id) {
        resetPresetEditor();
      }
    }, 'Пресет удален');
  };

  const startEditPhotoshoot = (item: AdminPhotoshoot) => {
    setEditingPhotoshootId(item.id);
    setPhotoshootForm({
      slug: item.slug,
      titleEn: item.titleEn,
      titleRu: item.titleRu,
      descriptionEn: item.descriptionEn,
      descriptionRu: item.descriptionRu,
      coverAssetKey: item.coverAssetKey ?? '',
      galleryAssetKeys: toStringArray(item.galleryAssetKeys).join('\n'),
      presetId: item.presetId ?? '',
      modelId: item.modelId ?? '',
      isPublished: item.isPublished
    });
  };

  const resetPhotoshootEditor = () => {
    setEditingPhotoshootId('');
    setPhotoshootForm(initialPhotoshootForm);
  };

  const savePhotoshoot = async () => {
    await runAction(async () => {
      const body = {
        slug: photoshootForm.slug,
        titleEn: photoshootForm.titleEn,
        titleRu: photoshootForm.titleRu,
        descriptionEn: photoshootForm.descriptionEn,
        descriptionRu: photoshootForm.descriptionRu,
        coverAssetKey: photoshootForm.coverAssetKey.trim() ? photoshootForm.coverAssetKey.trim() : null,
        galleryAssetKeys: linesToArray(photoshootForm.galleryAssetKeys),
        presetId: photoshootForm.presetId || null,
        modelId: photoshootForm.modelId || null,
        isPublished: photoshootForm.isPublished
      };

      if (editingPhotoshootId) {
        await requestJson(`/api/admin/photoshoots/${editingPhotoshootId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        await requestJson('/api/admin/photoshoots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      resetPhotoshootEditor();
    }, editingPhotoshootId ? 'Фотосессия обновлена' : 'Фотосессия создана');
  };

  const deletePhotoshoot = async (id: string) => {
    if (!window.confirm('Удалить фотосессию?')) {
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/photoshoots/${id}`, { method: 'DELETE' });
      if (editingPhotoshootId === id) {
        resetPhotoshootEditor();
      }
    }, 'Фотосессия удалена');
  };

  const startEditArticle = (item: AdminArticle) => {
    setEditingArticleId(item.id);
    setArticleForm({
      slug: item.slug,
      titleEn: item.titleEn,
      titleRu: item.titleRu,
      excerptEn: item.excerptEn,
      excerptRu: item.excerptRu,
      contentEn: jsonToText(item.contentEn, { format: 'blocks', blocks: [] }),
      contentRu: jsonToText(item.contentRu, { format: 'blocks', blocks: [] }),
      coverImageUrl: item.coverImageUrl,
      coverAltEn: item.coverAltEn ?? '',
      coverAltRu: item.coverAltRu ?? '',
      tagsEn: toStringArray(item.tagsEn).join(','),
      tagsRu: toStringArray(item.tagsRu).join(','),
      authorName: item.authorName,
      readingMinutes: item.readingMinutes,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : ''
    });
  };

  const resetArticleEditor = () => {
    setEditingArticleId('');
    setArticleForm(initialArticleForm);
  };

  const saveArticle = async () => {
    await runAction(async () => {
      const body = {
        slug: articleForm.slug,
        titleEn: articleForm.titleEn,
        titleRu: articleForm.titleRu,
        excerptEn: articleForm.excerptEn,
        excerptRu: articleForm.excerptRu,
        contentEn: JSON.parse(articleForm.contentEn || '{}'),
        contentRu: JSON.parse(articleForm.contentRu || '{}'),
        coverImageUrl: articleForm.coverImageUrl,
        coverAltEn: articleForm.coverAltEn.trim() || undefined,
        coverAltRu: articleForm.coverAltRu.trim() || undefined,
        tagsEn: articleForm.tagsEn
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        tagsRu: articleForm.tagsRu
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        authorName: articleForm.authorName,
        readingMinutes: Math.max(1, Math.trunc(articleForm.readingMinutes || 5)),
        isPublished: articleForm.isPublished,
        publishedAt: articleForm.publishedAt
          ? new Date(articleForm.publishedAt).toISOString()
          : null
      };

      if (editingArticleId) {
        await requestJson(`/api/admin/blog/articles/${editingArticleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        await requestJson('/api/admin/blog/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      resetArticleEditor();
    }, editingArticleId ? 'Статья обновлена' : 'Статья создана');
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm('Удалить статью?')) {
      return;
    }

    await runAction(async () => {
      await requestJson(`/api/admin/blog/articles/${id}`, { method: 'DELETE' });
      if (editingArticleId === id) {
        resetArticleEditor();
      }
    }, 'Статья удалена');
  };

  const uploadPresetCover = async (file: File | null) => {
    if (!file) {
      return;
    }

    const [key] = await uploadFiles([file]);
    if (!key) {
      return;
    }

    setPresetForm((prev) => ({ ...prev, coverAssetKey: key }));
  };

  const uploadPresetSamples = async (files: File[]) => {
    if (!files.length) {
      return;
    }

    const keys = await uploadFiles(files);
    if (!keys.length) {
      return;
    }

    setPresetForm((prev) => ({
      ...prev,
      sampleAssetKeys: [prev.sampleAssetKeys, ...keys].filter(Boolean).join('\n')
    }));
  };

  const uploadPhotoshootCover = async (file: File | null) => {
    if (!file) {
      return;
    }

    const [key] = await uploadFiles([file]);
    if (!key) {
      return;
    }

    setPhotoshootForm((prev) => ({ ...prev, coverAssetKey: key }));
  };

  const uploadPhotoshootGallery = async (files: File[]) => {
    if (!files.length) {
      return;
    }

    const keys = await uploadFiles(files);
    if (!keys.length) {
      return;
    }

    setPhotoshootForm((prev) => ({
      ...prev,
      galleryAssetKeys: [prev.galleryAssetKeys, ...keys].filter(Boolean).join('\n')
    }));
  };

  const sectionTabs: Array<{ key: AdminSection; label: string }> = [
    { key: 'overview', label: 'Главная' },
    { key: 'orders', label: 'Заказы' },
    { key: 'users', label: 'Пользователи' },
    { key: 'models', label: 'Модели' },
    { key: 'styles', label: 'Стили' },
    { key: 'presets', label: 'Пресеты' },
    { key: 'photoshoots', label: 'Фотосессии' },
    { key: 'blog', label: 'Блог' }
  ];

  return (
    <div className="space-y-7">
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow">Admin panel</span>
            <h1 className="section-title mt-4">Полное управление платформой</h1>
            <p className="section-subtitle mt-2">
              Редактирование пользователей, ролей, кредитов, моделей, стилей, пресетов, фотосессий и изображений.
            </p>
          </div>
          <button className="btn-ghost" onClick={() => void loadAll()} disabled={loading || busy || uploading}>
            {loading ? 'Обновление...' : 'Обновить данные'}
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <section className="card p-5">
        <h2 className="display text-2xl font-bold">Разделы админки</h2>
        <p className="mt-2 text-sm text-black/70">
          Сначала выберите нужный раздел, и откроется только соответствующий экран.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              className={activeSection === tab.key ? 'btn-primary px-4 py-2 text-sm' : 'btn-ghost px-4 py-2 text-sm'}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeSection === 'overview' ? (
        <section className="card p-5">
          <h2 className="display text-2xl font-bold">Быстрые действия</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button className="btn-primary" onClick={() => setActiveSection('orders')}>
              Создать заказ
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                resetPresetEditor();
                setActiveSection('presets');
              }}
            >
              Создать пресет
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                resetPhotoshootEditor();
                setActiveSection('photoshoots');
              }}
            >
              Создать фотосессию
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                resetArticleEditor();
                setActiveSection('blog');
              }}
            >
              Создать блог-статью
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                resetStyleEditor();
                setActiveSection('styles');
              }}
            >
              Создать стиль
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                resetModelEditor();
                setActiveSection('models');
              }}
            >
              Создать модель
            </button>
          </div>
        </section>
      ) : null}

      {(activeSection === 'overview' || activeSection === 'orders') ? (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Users" value={metrics?.usersTotal ?? 0} />
        <MetricCard title="Admins" value={metrics?.adminsTotal ?? 0} />
        <MetricCard title="Jobs Total" value={metrics?.jobsTotal ?? 0} />
        <MetricCard title="Jobs 24h" value={metrics?.jobsLast24h ?? 0} />
        <MetricCard title="Credits Issued" value={metrics?.creditsIssued ?? 0} />
        <MetricCard title="Credits Spent" value={metrics?.creditsSpent ?? 0} />
        <MetricCard title="Models" value={metrics?.modelsTotal ?? 0} />
        <MetricCard title="Presets / Photoshoots" value={`${metrics?.presetsTotal ?? 0} / ${metrics?.photoshootsTotal ?? 0}`} />
      </section>
      ) : null}

      {activeSection === 'orders' ? (
        <section className="card p-5">
          <h2 className="display text-2xl font-bold">Заказы (генерации)</h2>
          <p className="mt-2 text-sm text-black/70">
            Для создания нового заказа используйте App-экран генерации. В этом разделе отображаются ключевые метрики по заказам.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/app" className="btn-primary">
              Открыть App и создать заказ
            </a>
            <button className="btn-ghost" onClick={() => void loadAll(false)} disabled={loading || busy || uploading}>
              Обновить метрики
            </button>
          </div>
        </section>
      ) : null}

      {activeSection === 'users' ? (
      <section className="card p-5">
        <h2 className="display text-2xl font-bold">Пользователи: редактирование и кредиты</h2>

        {userForm ? (
          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--line)' }}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Editing user: {userForm.id}</p>
              <button className="btn-ghost px-3 py-1.5 text-xs" onClick={cancelEditUser}>
                Cancel
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border bg-white px-3 py-2"
                style={{ borderColor: 'var(--line)' }}
                value={userForm.email}
                onChange={(event) => setUserForm((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
                placeholder="email"
              />
              <input
                className="rounded-2xl border bg-white px-3 py-2"
                style={{ borderColor: 'var(--line)' }}
                value={userForm.name}
                onChange={(event) => setUserForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                placeholder="name"
              />
              <select
                className="rounded-2xl border bg-white px-3 py-2"
                style={{ borderColor: 'var(--line)' }}
                value={userForm.role}
                onChange={(event) =>
                  setUserForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          role: event.target.value as 'user' | 'admin'
                        }
                      : prev
                  )
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <select
                className="rounded-2xl border bg-white px-3 py-2"
                style={{ borderColor: 'var(--line)' }}
                value={userForm.locale}
                onChange={(event) =>
                  setUserForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          locale: event.target.value as 'en' | 'ru'
                        }
                      : prev
                  )
                }
              >
                <option value="en">en</option>
                <option value="ru">ru</option>
              </select>
              <label className="text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={userForm.isBlocked}
                  onChange={(event) =>
                    setUserForm((prev) => (prev ? { ...prev, isBlocked: event.target.checked } : prev))
                  }
                />
                Blocked
              </label>
            </div>
            <button className="btn-primary mt-3" onClick={() => void saveUser()} disabled={busy || uploading}>
              Save user
            </button>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(12, 41, 60, 0.08)' }}>
              <tr>
                <th className="px-3 py-2 text-left">Email / Name</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Locale</th>
                <th className="px-3 py-2 text-left">Blocked</th>
                <th className="px-3 py-2 text-left">Balance</th>
                <th className="px-3 py-2 text-left">Credits +/-</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-3 py-2">
                    <div>{item.email ?? 'no-email'}</div>
                    <div className="text-xs text-black/60">{item.name ?? 'Unnamed'}</div>
                    <div className="text-xs text-black/50">{formatDate(item.createdAt)}</div>
                  </td>
                  <td className="px-3 py-2">{item.type}</td>
                  <td className="px-3 py-2">{item.role}</td>
                  <td className="px-3 py-2">{item.locale}</td>
                  <td className="px-3 py-2">{item.isBlocked ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{item.balance}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <input
                        className="w-24 rounded-xl border bg-white px-2 py-1"
                        style={{ borderColor: 'var(--line)' }}
                        value={creditsDeltaByUserId[item.id] ?? ''}
                        onChange={(event) =>
                          setCreditsDeltaByUserId((prev) => ({ ...prev, [item.id]: event.target.value }))
                        }
                        placeholder="+10/-5"
                      />
                      <button
                        className="btn-ghost px-3 py-1.5 text-xs"
                        onClick={() => void adjustCredits(item.id)}
                        disabled={busy || uploading}
                      >
                        Apply
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => startEditUser(item)}>
                        Edit
                      </button>
                      {item.role === 'admin' ? (
                        <button
                          className="btn-ghost px-3 py-1.5 text-xs"
                          onClick={() => void updateRoleQuick(item.id, 'user')}
                          disabled={busy || uploading}
                        >
                          Make user
                        </button>
                      ) : (
                        <button
                          className="btn-secondary px-3 py-1.5 text-xs"
                          onClick={() => void updateRoleQuick(item.id, 'admin')}
                          disabled={busy || uploading}
                        >
                          Make admin
                        </button>
                      )}
                      <button
                        className="btn-secondary px-3 py-1.5 text-xs"
                        onClick={() => void deleteUserRecord(item.id)}
                        disabled={busy || uploading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeSection === 'models' ? (
      <section className="card p-5">
        <h2 className="display text-2xl font-bold">Модели: create / edit / delete</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-2xl border bg-white px-3 py-2"
            style={{ borderColor: 'var(--line)' }}
            value={modelForm.key}
            onChange={(event) => setModelForm((prev) => ({ ...prev, key: event.target.value }))}
            placeholder="key"
          />
          <input
            className="rounded-2xl border bg-white px-3 py-2"
            style={{ borderColor: 'var(--line)' }}
            value={modelForm.title}
            onChange={(event) => setModelForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="title"
          />
          <input
            className="rounded-2xl border bg-white px-3 py-2"
            style={{ borderColor: 'var(--line)' }}
            value={modelForm.providerKey}
            onChange={(event) => setModelForm((prev) => ({ ...prev, providerKey: event.target.value }))}
            placeholder="providerKey"
          />
          <textarea
            className="rounded-2xl border bg-white px-3 py-2"
            style={{ borderColor: 'var(--line)' }}
            value={modelForm.description}
            onChange={(event) => setModelForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="description"
            rows={2}
          />
          <label className="text-sm">
            <input
              type="checkbox"
              className="mr-2"
              checked={modelForm.isActive}
              onChange={(event) => setModelForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Active
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => void saveModel()} disabled={busy || uploading}>
            {editingModelId ? 'Update model' : 'Create model'}
          </button>
          {editingModelId ? (
            <button className="btn-ghost" onClick={resetModelEditor}>
              Cancel
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(12, 41, 60, 0.08)' }}>
              <tr>
                <th className="px-3 py-2 text-left">Key / Title</th>
                <th className="px-3 py-2 text-left">Provider</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2 text-left">Updated</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-3 py-2">
                    <b>{item.key}</b>
                    <div className="text-xs text-black/65">{item.title}</div>
                  </td>
                  <td className="px-3 py-2">{item.providerKey}</td>
                  <td className="px-3 py-2">{item.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{formatDate(item.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => startEditModel(item)}>
                        Edit
                      </button>
                      <button
                        className="btn-secondary px-3 py-1.5 text-xs"
                        onClick={() => void deleteModel(item.id)}
                        disabled={busy || uploading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeSection === 'styles' ? (
      <section className="card p-5">
        <h2 className="display text-2xl font-bold">Стили: create / edit / delete</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={styleForm.slug} onChange={(event) => setStyleForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="slug" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={styleForm.titleEn} onChange={(event) => setStyleForm((prev) => ({ ...prev, titleEn: event.target.value }))} placeholder="title EN" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={styleForm.titleRu} onChange={(event) => setStyleForm((prev) => ({ ...prev, titleRu: event.target.value }))} placeholder="title RU" />
          <label className="text-sm">
            <input type="checkbox" className="mr-2" checked={styleForm.isPublished} onChange={(event) => setStyleForm((prev) => ({ ...prev, isPublished: event.target.checked }))} />
            Published
          </label>
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={styleForm.descriptionEn} onChange={(event) => setStyleForm((prev) => ({ ...prev, descriptionEn: event.target.value }))} placeholder="description EN" rows={2} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={styleForm.descriptionRu} onChange={(event) => setStyleForm((prev) => ({ ...prev, descriptionRu: event.target.value }))} placeholder="description RU" rows={2} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--line)' }} value={styleForm.faqEn} onChange={(event) => setStyleForm((prev) => ({ ...prev, faqEn: event.target.value }))} placeholder="faqEn JSON" rows={5} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--line)' }} value={styleForm.faqRu} onChange={(event) => setStyleForm((prev) => ({ ...prev, faqRu: event.target.value }))} placeholder="faqRu JSON" rows={5} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 text-xs" style={{ borderColor: 'var(--line)' }} value={styleForm.sampleImages} onChange={(event) => setStyleForm((prev) => ({ ...prev, sampleImages: event.target.value }))} placeholder="sample image URLs (one per line)" rows={4} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--line)' }} value={styleForm.promptTemplate} onChange={(event) => setStyleForm((prev) => ({ ...prev, promptTemplate: event.target.value }))} placeholder="promptTemplate JSON" rows={4} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs md:col-span-2" style={{ borderColor: 'var(--line)' }} value={styleForm.defaultParams} onChange={(event) => setStyleForm((prev) => ({ ...prev, defaultParams: event.target.value }))} placeholder="defaultParams JSON" rows={4} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => void saveStyle()} disabled={busy || uploading}>
            {editingStyleId ? 'Update style' : 'Create style'}
          </button>
          {editingStyleId ? (
            <button className="btn-ghost" onClick={resetStyleEditor}>
              Cancel
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(12, 41, 60, 0.08)' }}>
              <tr>
                <th className="px-3 py-2 text-left">Slug / EN / RU</th>
                <th className="px-3 py-2 text-left">Published</th>
                <th className="px-3 py-2 text-left">Updated</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {styles.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-3 py-2">
                    <b>{item.slug}</b>
                    <div className="text-xs text-black/65">{item.titleEn}</div>
                    <div className="text-xs text-black/65">{item.titleRu}</div>
                  </td>
                  <td className="px-3 py-2">{item.isPublished ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{formatDate(item.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => startEditStyle(item)}>
                        Edit
                      </button>
                      <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => void deleteStyle(item.id)} disabled={busy || uploading}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeSection === 'blog' ? (
      <section className="card p-5">
        <h2 className="display text-2xl font-bold">Блог: create / edit / delete</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.slug} onChange={(event) => setArticleForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="slug" />
          <label className="text-sm">
            <input type="checkbox" className="mr-2" checked={articleForm.isPublished} onChange={(event) => setArticleForm((prev) => ({ ...prev, isPublished: event.target.checked }))} />
            Published
          </label>
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.titleEn} onChange={(event) => setArticleForm((prev) => ({ ...prev, titleEn: event.target.value }))} placeholder="title EN" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.titleRu} onChange={(event) => setArticleForm((prev) => ({ ...prev, titleRu: event.target.value }))} placeholder="title RU" />
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={articleForm.excerptEn} onChange={(event) => setArticleForm((prev) => ({ ...prev, excerptEn: event.target.value }))} placeholder="excerpt EN" rows={2} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={articleForm.excerptRu} onChange={(event) => setArticleForm((prev) => ({ ...prev, excerptRu: event.target.value }))} placeholder="excerpt RU" rows={2} />
          <input className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={articleForm.coverImageUrl} onChange={(event) => setArticleForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))} placeholder="coverImageUrl" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.coverAltEn} onChange={(event) => setArticleForm((prev) => ({ ...prev, coverAltEn: event.target.value }))} placeholder="coverAlt EN" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.coverAltRu} onChange={(event) => setArticleForm((prev) => ({ ...prev, coverAltRu: event.target.value }))} placeholder="coverAlt RU" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.authorName} onChange={(event) => setArticleForm((prev) => ({ ...prev, authorName: event.target.value }))} placeholder="authorName" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} type="number" min={1} max={120} value={articleForm.readingMinutes} onChange={(event) => setArticleForm((prev) => ({ ...prev, readingMinutes: Number.parseInt(event.target.value, 10) || 1 }))} placeholder="readingMinutes" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.tagsEn} onChange={(event) => setArticleForm((prev) => ({ ...prev, tagsEn: event.target.value }))} placeholder="tags EN (comma separated)" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={articleForm.tagsRu} onChange={(event) => setArticleForm((prev) => ({ ...prev, tagsRu: event.target.value }))} placeholder="tags RU (comma separated)" />
          <input className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} type="datetime-local" value={articleForm.publishedAt} onChange={(event) => setArticleForm((prev) => ({ ...prev, publishedAt: event.target.value }))} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--line)' }} value={articleForm.contentEn} onChange={(event) => setArticleForm((prev) => ({ ...prev, contentEn: event.target.value }))} placeholder="contentEn JSON" rows={10} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--line)' }} value={articleForm.contentRu} onChange={(event) => setArticleForm((prev) => ({ ...prev, contentRu: event.target.value }))} placeholder="contentRu JSON" rows={10} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => void saveArticle()} disabled={busy || uploading}>
            {editingArticleId ? 'Update article' : 'Create article'}
          </button>
          {editingArticleId ? (
            <button className="btn-ghost" onClick={resetArticleEditor}>
              Cancel
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(12, 41, 60, 0.08)' }}>
              <tr>
                <th className="px-3 py-2 text-left">Slug / EN / RU</th>
                <th className="px-3 py-2 text-left">Published</th>
                <th className="px-3 py-2 text-left">Published At</th>
                <th className="px-3 py-2 text-left">Updated</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-3 py-2">
                    <b>{item.slug}</b>
                    <div className="text-xs text-black/65">{item.titleEn}</div>
                    <div className="text-xs text-black/65">{item.titleRu}</div>
                  </td>
                  <td className="px-3 py-2">{item.isPublished ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{item.publishedAt ? formatDate(item.publishedAt) : '-'}</td>
                  <td className="px-3 py-2">{formatDate(item.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => startEditArticle(item)}>
                        Edit
                      </button>
                      <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => void deleteArticle(item.id)} disabled={busy || uploading}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeSection === 'presets' ? (
      <section className="card p-5">
        <h2 className="display text-2xl font-bold">Пресеты: create / edit / delete + upload</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={presetForm.slug} onChange={(event) => setPresetForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="slug" />
          <select className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={presetForm.modelId} onChange={(event) => setPresetForm((prev) => ({ ...prev, modelId: event.target.value }))}>
            <option value="">model (optional)</option>
            {modelOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={presetForm.titleEn} onChange={(event) => setPresetForm((prev) => ({ ...prev, titleEn: event.target.value }))} placeholder="title EN" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={presetForm.titleRu} onChange={(event) => setPresetForm((prev) => ({ ...prev, titleRu: event.target.value }))} placeholder="title RU" />
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={presetForm.descriptionEn} onChange={(event) => setPresetForm((prev) => ({ ...prev, descriptionEn: event.target.value }))} placeholder="description EN" rows={2} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={presetForm.descriptionRu} onChange={(event) => setPresetForm((prev) => ({ ...prev, descriptionRu: event.target.value }))} placeholder="description RU" rows={2} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--line)' }} value={presetForm.promptTemplate} onChange={(event) => setPresetForm((prev) => ({ ...prev, promptTemplate: event.target.value }))} placeholder="promptTemplate JSON" rows={4} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--line)' }} value={presetForm.defaultParams} onChange={(event) => setPresetForm((prev) => ({ ...prev, defaultParams: event.target.value }))} placeholder="defaultParams JSON" rows={4} />

          <div className="md:col-span-2 rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
            <p className="mb-2 text-sm font-semibold">Upload cover</p>
            <input type="file" accept="image/*" onChange={(event) => void uploadPresetCover(event.target.files?.[0] ?? null)} />
          </div>
          <input className="rounded-2xl border bg-white px-3 py-2 text-xs md:col-span-2" style={{ borderColor: 'var(--line)' }} value={presetForm.coverAssetKey} onChange={(event) => setPresetForm((prev) => ({ ...prev, coverAssetKey: event.target.value }))} placeholder="coverAssetKey" />

          <div className="md:col-span-2 rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
            <p className="mb-2 text-sm font-semibold">Upload sample images (multiple)</p>
            <input type="file" accept="image/*" multiple onChange={(event) => void uploadPresetSamples(Array.from(event.target.files ?? []))} />
          </div>
          <textarea className="rounded-2xl border bg-white px-3 py-2 text-xs md:col-span-2" style={{ borderColor: 'var(--line)' }} value={presetForm.sampleAssetKeys} onChange={(event) => setPresetForm((prev) => ({ ...prev, sampleAssetKeys: event.target.value }))} placeholder="sampleAssetKeys (one storageKey per line)" rows={5} />

          <label className="text-sm">
            <input type="checkbox" className="mr-2" checked={presetForm.isPublished} onChange={(event) => setPresetForm((prev) => ({ ...prev, isPublished: event.target.checked }))} />
            Published
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => void savePreset()} disabled={busy || uploading}>
            {editingPresetId ? 'Update preset' : 'Create preset'}
          </button>
          {editingPresetId ? (
            <button className="btn-ghost" onClick={resetPresetEditor}>
              Cancel
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(12, 41, 60, 0.08)' }}>
              <tr>
                <th className="px-3 py-2 text-left">Slug / EN / RU</th>
                <th className="px-3 py-2 text-left">Model</th>
                <th className="px-3 py-2 text-left">Published</th>
                <th className="px-3 py-2 text-left">Updated</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {presets.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-3 py-2">
                    <b>{item.slug}</b>
                    <div className="text-xs text-black/65">{item.titleEn}</div>
                    <div className="text-xs text-black/65">{item.titleRu}</div>
                  </td>
                  <td className="px-3 py-2">{item.model?.title ?? '-'}</td>
                  <td className="px-3 py-2">{item.isPublished ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{formatDate(item.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => startEditPreset(item)}>
                        Edit
                      </button>
                      <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => void deletePreset(item.id)} disabled={busy || uploading}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeSection === 'photoshoots' ? (
      <section className="card p-5">
        <h2 className="display text-2xl font-bold">Фотосессии: create / edit / delete + upload</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.slug} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="slug" />
          <select className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.presetId} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, presetId: event.target.value }))}>
            <option value="">preset (optional)</option>
            {presetOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.titleEn} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, titleEn: event.target.value }))} placeholder="title EN" />
          <input className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.titleRu} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, titleRu: event.target.value }))} placeholder="title RU" />
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.descriptionEn} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, descriptionEn: event.target.value }))} placeholder="description EN" rows={2} />
          <textarea className="rounded-2xl border bg-white px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.descriptionRu} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, descriptionRu: event.target.value }))} placeholder="description RU" rows={2} />
          <select className="rounded-2xl border bg-white px-3 py-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.modelId} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, modelId: event.target.value }))}>
            <option value="">model (optional)</option>
            {modelOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="text-sm">
            <input type="checkbox" className="mr-2" checked={photoshootForm.isPublished} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, isPublished: event.target.checked }))} />
            Published
          </label>

          <div className="md:col-span-2 rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
            <p className="mb-2 text-sm font-semibold">Upload cover</p>
            <input type="file" accept="image/*" onChange={(event) => void uploadPhotoshootCover(event.target.files?.[0] ?? null)} />
          </div>
          <input className="rounded-2xl border bg-white px-3 py-2 text-xs md:col-span-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.coverAssetKey} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, coverAssetKey: event.target.value }))} placeholder="coverAssetKey" />

          <div className="md:col-span-2 rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
            <p className="mb-2 text-sm font-semibold">Upload gallery images (multiple)</p>
            <input type="file" accept="image/*" multiple onChange={(event) => void uploadPhotoshootGallery(Array.from(event.target.files ?? []))} />
          </div>
          <textarea className="rounded-2xl border bg-white px-3 py-2 text-xs md:col-span-2" style={{ borderColor: 'var(--line)' }} value={photoshootForm.galleryAssetKeys} onChange={(event) => setPhotoshootForm((prev) => ({ ...prev, galleryAssetKeys: event.target.value }))} placeholder="galleryAssetKeys (one storageKey per line)" rows={5} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => void savePhotoshoot()} disabled={busy || uploading}>
            {editingPhotoshootId ? 'Update photoshoot' : 'Create photoshoot'}
          </button>
          {editingPhotoshootId ? (
            <button className="btn-ghost" onClick={resetPhotoshootEditor}>
              Cancel
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(12, 41, 60, 0.08)' }}>
              <tr>
                <th className="px-3 py-2 text-left">Slug / EN / RU</th>
                <th className="px-3 py-2 text-left">Preset / Model</th>
                <th className="px-3 py-2 text-left">Published</th>
                <th className="px-3 py-2 text-left">Updated</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {photoshoots.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-3 py-2">
                    <b>{item.slug}</b>
                    <div className="text-xs text-black/65">{item.titleEn}</div>
                    <div className="text-xs text-black/65">{item.titleRu}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{item.preset?.titleEn ?? '-'}</div>
                    <div className="text-xs text-black/65">{item.model?.title ?? '-'}</div>
                  </td>
                  <td className="px-3 py-2">{item.isPublished ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{formatDate(item.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => startEditPhotoshoot(item)}>
                        Edit
                      </button>
                      <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => void deletePhotoshoot(item.id)} disabled={busy || uploading}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="metric-card">
      <p className="text-xs uppercase tracking-[0.12em] text-black/55">{title}</p>
      <p className="mt-2 display text-3xl font-bold">{value}</p>
    </div>
  );
}
