# Blog Articles Architecture

## Data model

Articles are stored in `blog_articles` with EN/RU localization in one record:

- `slug` (shared URL key for both locales)
- localized fields: `titleEn/titleRu`, `excerptEn/excerptRu`, `contentEn/contentRu`, `coverAltEn/coverAltRu`, `tagsEn/tagsRu`
- shared fields: `coverImageUrl`, `authorName`, `readingMinutes`, `isPublished`, `publishedAt`

`contentEn/contentRu` support two formats:

1. `html`:

```json
{ "format": "html", "html": "<h2>...</h2><p>...</p>" }
```

2. `blocks`:

```json
{
  "format": "blocks",
  "blocks": [
    { "type": "h2", "text": "Section title" },
    { "type": "p", "text": "Paragraph text" },
    { "type": "ul", "items": ["One", "Two"] },
    { "type": "quote", "text": "Quote", "cite": "Author" },
    { "type": "image", "src": "/samples/example.svg", "alt": "Alt", "caption": "Optional caption" }
  ]
}
```

## API

Public:

- `GET /api/blog/articles?lang=en|ru`
- `GET /api/blog/articles/:slug?lang=en|ru`

Admin (Basic auth):

- `GET /api/admin/blog/articles`
- `POST /api/admin/blog/articles`
- `PUT /api/admin/blog/articles/:id`
- `DELETE /api/admin/blog/articles/:id`

## Image strategy

Store image URLs inside article fields (`coverImageUrl` and `image.src` blocks). Binary files should live in object storage/CDN; DB stores metadata and links.

## Example create request

```bash
curl -u admin:admin -X POST http://localhost:8090/api/admin/blog/articles \
  -H 'content-type: application/json' \
  -d '{
    "slug":"sample-article",
    "titleEn":"Sample article",
    "titleRu":"Пример статьи",
    "excerptEn":"Short EN description",
    "excerptRu":"Короткое описание RU",
    "contentEn":{"format":"html","html":"<p>Hello EN</p>"},
    "contentRu":{"format":"blocks","blocks":[{"type":"p","text":"Привет RU"}]},
    "coverImageUrl":"/samples/cinematic-portrait-1.svg",
    "coverAltEn":"Cover EN",
    "coverAltRu":"Обложка RU",
    "tagsEn":["AI","Workflow"],
    "tagsRu":["AI","Workflow"],
    "authorName":"Picoria Editorial",
    "readingMinutes":5,
    "isPublished":true,
    "publishedAt":"2026-02-20T09:00:00.000Z"
  }'
```
