Sanity → Next.js Revalidation (Webhook Setup)

Overview
- This project uses Next.js tag-based caching and revalidates on-demand when Sanity content changes.
- Endpoint: `/api/revalidate`
- Method: `POST`
- Auth: Provide `Authorization: Bearer <SANITY_REVALIDATE_SECRET>` header or `?secret=<SANITY_REVALIDATE_SECRET>` query param.

Environment
- Add `SANITY_REVALIDATE_SECRET` to your deployment environment (e.g., `.env.local`, Vercel Project Settings).

Suggested Tags Used in Code
- Lists/overview pages: `posts`, `categories`
- Individual post pages: `post:{slug}`

Sanity Webhook Configuration
1) In Sanity Manage → API → Webhooks → Create webhook
   - URL: `https://<your-domain>/api/revalidate`
   - HTTP method: `POST`
   - Include drafts: off (usually)
   - Filter: `(_type == "post" || _type == "category")`
   - Secret header: `Authorization: Bearer <your-secret>` (recommended)
   - Body format: JSON, include slug in body. For example, set the payload mapping to include:
     ```json
     {
       "_type": "@type",
       "operation": "@event",
       "slug": "@doc.slug.current"
     }
     ```
   - Trigger on: create, update, delete, publish, unpublish

Local Testing
- Send a POST request:
  ```bash
  curl -X POST "http://localhost:3000/api/revalidate?secret=$SANITY_REVALIDATE_SECRET" \
       -H "Content-Type: application/json" \
       -d '{"slug":"my-post-slug"}'
  ```

Notes
- If a slug is provided, the endpoint revalidates `post:{slug}` and the list tags. If not, it revalidates just the list tags.
- You can expand tags later (e.g., `authors`, `settings`) and call `revalidateTag` accordingly.

