local function expand(tex)
  local function replace(opening, closing)
    return function(argument)
      local body = argument:sub(2, -2)
      return opening .. expand(body) .. closing
    end
  end

  -- %b{} matches a balanced pair of braces, including nested groups.
  tex = tex:gsub("\\Set(%b{})", replace("\\left\\{", "\\right\\}"))
  return tex:gsub("\\set(%b{})", replace("\\{", "\\}"))
end

function Math(el)
  el.text = expand(el.text)
  return el
end
