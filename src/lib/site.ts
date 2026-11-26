import atlas from '../../public/atlas/current-catalog.json';
export const base = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path: string = "") => `${base}/${path.replace(/^\//, "")}`;
export const github = "https://github.com/Weicheng-Gu1/frontier-blender-web";
export const categories = atlas.groups.map(group=>group.id);
export const labels: Record<string,string> = Object.fromEntries(atlas.groups.map(group=>[group.id,group.label]));
export const categoryLines: Record<string,string> = Object.fromEntries(atlas.groups.map(g=>[g.id,g.labelLines.join('\n')]));
const displayNames: Record<string,string> = {
  "gpt-6.1-sol/high": "GPT-6.1-Sol (high)",
  "gpt-6.2-astra/high": "GPT-6.2-Astra (high)",
  "gpt-6-astra/high": "GPT-6-Astra (high)",
  "gpt-6-astra/low": "GPT-6-Astra (low)",
  "gpt-5.6-sol/high": "GPT-5.6-Sol (low)",
  "claude-opus-5-5/default": "Claude Opus 5.5 (medium)",
  "deepseek-flash/default": "DeepSeek-v4.1-flash-1017 (high)",
  "qwen3.8-max/default": "Qwen3.8-Max (high)",
  "qwen4-max-preview/default": "Qwen4-Max-Preview (high)",
  "kimi-k3.1-pro/default": "Kimi-K3.1-Pro (high)",
  "glm-5.3-flash/default": "GLM-5.3-Flash(high)"
};
export const modelName = (m: {model:string,effort:string}) => displayNames[m.model+"/"+m.effort] || m.model;
export const score = (n:number) => (100*n).toFixed(2);
export const tokens = (n:number) => n>=1e6 ? `${(n/1e6).toFixed(2)}M` : `${(n/1e3).toFixed(1)}K`;
