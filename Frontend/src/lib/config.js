// Central place for sandbox URLs. Override via Vite env vars for local dev without k8s,
// e.g. VITE_AGENT_URL=http://localhost:3000 VITE_PREVIEW_URL=http://localhost:5173
const agentOverride = import.meta.env.VITE_AGENT_URL
const previewOverride = import.meta.env.VITE_PREVIEW_URL

export const agentUrl = (sandboxId) =>
  agentOverride || `http://${sandboxId}.agent.localhost`

export const previewUrl = (sandboxId) =>
  previewOverride || `http://${sandboxId}.preview.localhost`
