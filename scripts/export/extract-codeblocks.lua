local input_stem = pandoc.path.split_extension(
  pandoc.path.filename(PANDOC_STATE.input_files[1])
)
local output_dir = pandoc.path.directory(PANDOC_STATE.output_file)

local diagram_counts = {
  tikz = 0,
  mermaid = 0,
}

local function next_diagram_suffix(kind)
  diagram_counts[kind] = diagram_counts[kind] + 1
  return string.format("%s-%d", kind, diagram_counts[kind])
end

local function extract_codeblock(kind, extension, source)
  local diagram_suffix = next_diagram_suffix(kind)
  local diagram_name = string.format("%s-%s", input_stem, diagram_suffix)
  local source_path = pandoc.path.join({ output_dir, diagram_name .. "." .. extension })
  local diagram_path = diagram_name .. ".svg"

  pandoc.system.write_file(source_path, source)

  local diagram = pandoc.Image({ pandoc.Str(diagram_name) }, diagram_path)
  return pandoc.Para({ diagram })
end

local codeblock_handlers = {
  tikz = function(codeblock)
    local source = string.format([[
\documentclass[tikz]{standalone}
\usepackage{tikz}
\begin{document}
%s
\end{document}
]], codeblock.text)
    return extract_codeblock("tikz", "tex", source)
  end,

  mermaid = function(codeblock)
    return extract_codeblock("mermaid", "mmd", codeblock.text)
  end,

  jsxgraph = function()
    return {}
  end,

  abc = function()
    return {}
  end,
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
