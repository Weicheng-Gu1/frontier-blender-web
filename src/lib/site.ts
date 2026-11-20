export const base = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path: string = "") => `${base}/${path.replace(/^\//, "")}`;
export const github = "https://github.com/Weicheng-Gu1/frontier-blender-web";
export const categories = ["objects", "object-arrangements", "interiors", "buildings", "blocks", "cities"];
export const labels: Record<string,string> = {objects:"Objects", "object-arrangements":"Object arrangements",interiors:"Interiors",buildings:"Buildings",blocks:"Blocks",cities:"Cities"};
const names: Record<string,string> = {"qwen4-max-preview":"Qwen4-Max-Preview", "qwen3.8-max":"Qwen3.8-Max", "deepseek-flash":"DeepSeek-v4.1-Flash-1017", "glm-5.3-flash":"GLM-5.3-Flash", "gpt-6-astra":"GPT-6-Astra", "claude-opus-5-5":"Opus-5.5", "kimi-k3.1-pro":"Kimi-K3.1-Pro"};
export const modelName = (m: {model:string,effort:string}) => (names[m.model] || m.model)+(m.effort === "default" ? "" : ` (${m.effort})`);
export const score = (n:number) => (100*n).toFixed(2);
export const tokens = (n:number) => n>=1e6 ? `${(n/1e6).toFixed(2)}M` : `${(n/1e3).toFixed(1)}K`;
