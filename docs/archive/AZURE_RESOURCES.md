# AZURE_RESOURCES.md — O-TRAVELZ Azure Resource Inventory & Cost Control

> This file tracks all Azure cloud resources provisioned or planned for O-TRAVELZ.
> **DO NOT COMMIT SECRETS, API KEYS, OR CONNECTION STRINGS TO THIS FILE.**
> All sensitive configuration must remain in local `.env` files or environment variables only.

---

## 1. Resource Governance Policy

1. **Credit Usage Guard**: Use Azure credits only for capabilities that tangibly improve the Round 2 product (multimodal landmark inference, batch image validation, blob asset hosting).
2. **No Always-On Heavy Compute**: Do not provision AKS, GPU VMs, App Service Premium, or managed PostgreSQL instances purely because credits exist.
3. **Consumption & Low-Tier First**: Prefer serverless/consumption pricing models and standard blob storage.
4. **Local Fallback Preservation**: Every Azure-backed capability must have a working local fallback (e.g. `LocalStorageProvider` if Blob Storage is unconfigured; rule-based / local heuristic if Azure OpenAI is unreachable).

---

## 2. Resource Inventory Table

| Resource Name | Type | Region | Purpose | SKU / Tier | Environment Variable Names | Created Date | Expected Cost | Deletion Instructions | Status |
|---|---|---|---|---|---|---|---|---|---|
| *(Planned: `otravelz-storage`)* | Storage Account (Blob) | `centralindia` / `eastus` | WebP image asset storage & CDN delivery | Standard LRS (Hot/Cool) | `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`, `AZURE_STORAGE_CONTAINER_NAME` | Planned (Phase 1C) | ~$0.50 – $2.00 / month | Delete via Azure Portal or `az storage account delete` | `PLANNED` |
| *(Existing/Configured: Azure OpenAI)* | Azure OpenAI Service | Configured in tenant | Primary conversational LLM & multimodal inference | Pay-as-you-go (per 1K tokens) | `AI_API_BASE_URL`, `AI_API_KEY`, `AI_AZURE_DEPLOYMENT_NAME`, `AI_AZURE_API_VERSION` | Pre-existing | Consumption-based | Delete deployment in Azure AI Foundry / Azure Portal | `CONFIGURED_PENDING_VERIFY` |

---

## 3. Azure OpenAI Deployment Details

- **Endpoint**: Configured via `AI_API_BASE_URL` (e.g., `https://<resource>.openai.azure.com`)
- **API Version**: `2024-12-01-preview`
- **Supported Capabilities**:
  - Chat / Tool calling: Supported via standard OpenAI-compatible `/chat/completions` API
  - Multimodal Vision: Dependent on deployed model (e.g., `gpt-4o`, `gpt-4o-mini`). Requires active deployment verification.
- **Provider Chain Position**: Primary (Tier 1) in backend provider fallback chain (`Azure OpenAI` → `Gemini` → `NVIDIA` → `Groq` → `Rule-based`).

---

## 4. Storage Architecture

```
StorageProvider (ABC in backend/app/storage/base.py)
├── LocalStorageProvider (backend/app/storage/local.py) — DEFAULT (active)
└── AzureBlobStorageProvider (backend/app/storage/azure_blob.py) — READY (adapter implemented & unit-tested)
```

Configuration switch in `.env`:
```bash
STORAGE_BACKEND=local # or 'azure'
AZURE_STORAGE_ACCOUNT_NAME=...
AZURE_STORAGE_ACCOUNT_KEY=...
AZURE_STORAGE_CONTAINER_NAME=otravelz-images
```

---

## 5. Deletion & Cleanup Playbook

When Round 2 evaluation concludes or credit window expires:
1. Set `STORAGE_BACKEND=local` in backend `.env`.
2. Sync any newly validated assets from Blob container down to `data/images/`.
3. Run `az storage account delete --name <account_name> --resource-group <rg_name>` or delete resource group in Azure Portal.
