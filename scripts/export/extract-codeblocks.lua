local input_file = PANDOC_STATE.input_files[1]
local input_path_stem = pandoc.path.split_extension(input_file)
local input_stem = pandoc.path.filename(input_path_stem)

local diagram_counts = {
  tikz = 0,
  mermaid = 0,
}

local TIKZ_PREAMBLE = [[
\documentclass[tikz]{standalone}
\usepackage{tikz}
\begin{document}
]]

local TIKZ_POSTAMBLE = [[
\end{document}
]]

local function next_diagram_suffix(kind)
  diagram_counts[kind] = diagram_counts[kind] + 1
  return string.format("%s-%d", kind, diagram_counts[kind])
end

local function extract_codeblock(kind, extension, source)
  local diagram_suffix = next_diagram_suffix(kind)
  local source_path = string.format("%s-%s.%s", input_path_stem, diagram_suffix, extension)
  local diagram_name = string.format("%s-%s", input_stem, diagram_suffix)
  local diagram_path = diagram_name .. ".svg"

  pandoc.system.write_file(source_path, source)

  local diagram = pandoc.Image({ pandoc.Str(diagram_name) }, diagram_path)
  return pandoc.Para({ diagram })
end

local codeblock_handlers = {
  tikz = function(codeblock)
    local source = TIKZ_PREAMBLE .. codeblock.text .. TIKZ_POSTAMBLE
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
