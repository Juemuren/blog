local input_stem = pandoc.path.split_extension(
  pandoc.path.filename(PANDOC_STATE.input_files[1])
)
local output_dir = pandoc.path.directory(PANDOC_STATE.output_file)

local function format_source(template)
  return function(source)
    return string.format(template, source)
  end
end

local function make_extractor(kind, extension, render_source)
  local count = 0

  return function(codeblock)
    count = count + 1
    local diagram_name = string.format("%s-%s-%d", input_stem, kind, count)
    pandoc.system.write_file(
      pandoc.path.join({ output_dir, diagram_name .. "." .. extension }),
      render_source(codeblock.text)
    )
    return pandoc.Para({
      pandoc.Image({ pandoc.Str(diagram_name) }, diagram_name .. ".svg")
    })
  end
end

local function identity(value)
  return value
end

local function discard()
  return {}
end

local codeblock_handlers = {
  tikz = make_extractor("tikz", "tex", format_source([[
\documentclass[tikz]{standalone}
\usepackage{tikz}
\begin{document}
%s
\end{document}
]])),
  cetz = make_extractor("cetz", "typ", format_source([[
#import "@preview/cetz:0.5.2"
#set page(width: auto, height: auto, margin: 0pt, fill: none)
#cetz.canvas({
import cetz.draw: *
%s
})
]])),
  mermaid = make_extractor("mermaid", "mmd", identity),
  jsxgraph = discard,
  abc = discard,
}

function CodeBlock(codeblock)
  for _, class in ipairs(codeblock.classes) do
    local handler = codeblock_handlers[class]
    if handler then
      return handler(codeblock)
    end
  end

  return nil
end
