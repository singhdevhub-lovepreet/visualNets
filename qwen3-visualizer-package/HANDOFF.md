# Transformer Visualizer — Session Handoff

This folder is the complete record of building `qwen3-visualizer.html`, an interactive
educational simulator of the Qwen3-0.6B forward pass. Use this document to rebuild,
extend, or clone it for **other model architectures** on any machine.

## Files

| File | What it is |
|---|---|
| `qwen3-visualizer.html` | The deliverable. One self-contained file: HTML + CSS + vanilla JS + SVG. No dependencies, works offline. |
| `qwen3-visualizer-session-transcript.jsonl` | Raw Claude Code session transcript (every prompt, tool call, and edit). Machine-readable JSONL; grep it for any detail not covered here. |
| `HANDOFF.md` | This file. |

---

## 1. The original brief (condensed, re-promptable)

Build an interactive simulator (not an infographic) of a transformer forward pass where
tensors *visibly move* through the network. Single self-contained HTML file, no frameworks.
Aesthetic: Apple + Linear + 3Blue1Brown + Distill.pub — dark, glassmorphism, animated,
educational-first ("every animation must teach a concept").

Required coverage: tokenizer (BPE) → embedding lookup → hidden state → transformer block
(RMSNorm / attention / residual / FFN) → attention exploded (Q/K/V projections with
tooltips, QKᵀ, causal mask, softmax heatmap with per-cell hover, context = A·V, output
projection) → GQA with KV-cache-shrinking animation → RMSNorm number demo → SwiGLU with
gated neurons → residual "two rivers" → all-N-layers cascade (first 3 full, rest fast) →
output head (logit bars → softmax → glowing top-k). Progressive zoom levels L0→L3,
clickable everything, always-visible tensor shapes, transport controls
(play/pause/step/restart/speed/zoom), side inspector panel
(purpose / shapes / formula / intuition / example).

## 2. Design system (reuse as-is for sibling visualizers)

- **Ground**: `#0B0F1A` deep blue-black; glass cards `rgba(148,163,190,.055)` with 1px
  `rgba(148,163,190,.16)` borders; blue-biased neutrals (`#E7ECF6 / #93A0B8 / #5B6880`).
- **Categorical palette (validated for CVD + contrast on the dark surface)** — color by
  *tensor role*, never decoration:
  - flow / hidden state `#2E9FC6` (cyan) · Query `#D07E33` (amber) · Key `#2FA97C` (mint)
  - Value `#9C6BD9` (lilac) · winner/prediction `#B78C1F` (gold)
  - Brighter text tints per hue exist as `--t-*` vars (labels only; fills use `--c-*`).
  - For a new palette, run the dataviz skill's `validate_palette.js` in `--mode dark
    --surface "#0B0F1A"` — keep OKLCH lightness in the 0.48–0.67 band.
- **Type roles**: serif (New York/Georgia) for explanatory prose (Distill voice), system
  sans for UI chrome, monospace for every tensor/number/shape. Keep this three-role split.
- **Layout**: left rail = pipeline navigator · center = animated stage · right = inspector
  · bottom = transport bar. Breadcrumb in the top bar encodes zoom depth (L0/L1/L2).

## 3. Code architecture (inside the HTML file)

Everything lives in one `<script>`; the key abstractions:

- **`h(tag, attrs, ...kids)` / `sv(...)`** — DOM/SVG builders. NOTE: string children
  containing HTML markup are auto-parsed via a wrapped `<span>` (this was a bug fix —
  don't pass raw tags expecting text).
- **Scene engine** — `SCENES[id] = { title, level, parent, info, mount(stage)→ctx,
  steps: [{name, caption, hold, info?, run(ctx, {instant})}] }`.
  - `mount()` builds the full DOM (final state hidden behind `.rv` reveal classes).
  - Each `step.run` is *additive*; jumping backwards remounts and fast-applies steps
    `0..i-1` with `instant:true`, so steps must be idempotent under instant replay.
  - `parent` chains drive the breadcrumb and Esc-to-zoom-out.
- **Animation helpers** — `fly(from, to, {color,n,ms})` particle motes (WAAPI),
  `travel(from, to, label)` the tensor chip that rides between boxes, `stagger`,
  `tweenText` for number morphs. All durations go through `dur(ms)` which respects the
  speed slider and `prefers-reduced-motion`.
- **Deterministic numbers** — `rng(seed)` (mulberry32) so every hover value is stable
  across steps/replays. Never use `Math.random()` for displayed data.
- **Deep links** — `#sceneId/stepIndex` (e.g. `#attention/5`). Used both as a user
  feature and as the **testing hook** (see §5).
- **Widgets** — `matrixEl()` (sampled columns + ellipsis for wide tensors), `arrow()`,
  chips, heat cells (`color-mix` fill by weight), KV-cache bars, neuron rows, prob list.

## 4. Cloning for another model — the actual recipe

The engine is model-agnostic; the model lives in the *data*. To make e.g. a Llama-3-8B
or GPT-2 version:

1. **Copy the file**, rename, update `<title>` and the brand text.
2. **Swap the spec card + shapes** (the numbers appear in: rail `spec` card, `INFO`
   cards, overview box subtitles, and each scene's matrices/chips). Search for
   `1024`, `151936`, `3072`, `28`, `16 × 128`, `8 × 128` — these are the config surface.
3. **Adjust architecture-specific scenes**:
   - GQA scene: change the head ratio (Llama-3-8B: 32 Q / 8 KV → group size 4;
     GPT-2: pure MHA → replace GQA scene with a plain MHA explainer;
     MQA models: 1 shared KV head).
   - FFN scene: GPT-2 uses GELU MLP (no gate) → drop the gate branch; most modern
     models keep SwiGLU with different dims.
   - Norms: GPT-2/BERT use LayerNorm (mean-subtraction step added, post-norm placement);
     note Qwen3's extra QK-norm doesn't apply elsewhere.
   - Positional encoding: RoPE tags in the attention scene vs learned positions (GPT-2).
4. **Keep the attention numbers honest**: the 3×3 example is real math —
   `softmax([1.40, 2.35]) ≈ [0.28, 0.72]`. If you change the example sentence or
   weights, recompute so softmax rows actually sum to 1 from the shown raw scores.
5. **Prediction demo**: pick top-k continuations that plausibly follow the demo
   sentence (we deliberately deviated from the spec's "cat 0.71/dog 0.15" because the
   input already contained "cats").

Reference configs to carry forward:

| Model | d_model | layers | Q/KV heads | FFN | vocab | notes |
|---|---|---|---|---|---|---|
| Qwen3-0.6B (this file) | 1024 | 28 | 16 / 8 ×128 | 3072 SwiGLU | 151936 | QK-norm, tied embeddings |
| Llama-3-8B | 4096 | 32 | 32 / 8 ×128 | 14336 SwiGLU | 128256 | RoPE, RMSNorm |
| Mistral-7B | 4096 | 32 | 32 / 8 ×128 | 14336 SwiGLU | 32000 | sliding-window attn (new scene idea!) |
| GPT-2 small | 768 | 12 | 12 / 12 ×64 | 3072 GELU | 50257 | LayerNorm, learned positions, post-norm |

## 5. Verification workflow (do this after every clone/edit)

```bash
# 1. JS syntax
awk '/^<script>$/{f=1;next}/^<\/script>$/{f=0}f' FILE.html > /tmp/app.js && node --check /tmp/app.js

# 2. Screenshot every scene via deep links (headless Chrome), then LOOK at them
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for s in "overview" "attention/7" "gqa/2" "head/4" "block/3" "ffn/3" "embedding/3"; do
  "$C" --headless=new --disable-gpu --virtual-time-budget=6000 --window-size=1500,950 \
       --screenshot="/tmp/shot-${s%%/*}.png" "file://$PWD/FILE.html#$s" 2>/dev/null
done
```

Bugs this caught last time: a literal "null" from `Element.append(null)` in the
inspector, and raw `<b>` tags rendering as text in captions.

## 6. Re-prompt template for a fresh Claude session

> Read HANDOFF.md in this folder. Clone qwen3-visualizer.html into a
> {MODEL}-visualizer.html following §4: same scene engine, design system, and
> verification workflow; swap the config, GQA/FFN/norm scenes per the table.
> Keep all displayed math honest and verify with §5 before finishing.

---
*Built 2026-07-02 with Claude Code. Artifact mirror:
https://claude.ai/code/artifact/01082945-e6b0-46e0-ae8a-b48ddc4464bf*
